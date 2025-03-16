
import logging
import langchain
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables import RunnableSequence
from langchain_community.callbacks import get_openai_callback
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# Configure langchain settings
langchain.verbose = False
langchain.debug = False
langchain.llm_cache = False


MODEL_NAME = "o3-mini"

def choose_model(model_name):
    if "gemini" in model_name:
        llm = ChatGoogleGenerativeAI(temperature=0, model=MODEL_NAME)
    else:
        llm = ChatOpenAI(model_name=MODEL_NAME)

    return llm


# ================================
# Writer
# ================================



class Source(BaseModel):
    subreddit: str = Field(description="Name of the subreddit (including r/ prefix)")
    postId: str = Field(description="Reddit's unique identifier for the post")
    postTitle: str = Field(description="Original title of the Reddit post")
    url: str = Field(description="Full URL to the Reddit post")
    commentCount: Optional[int] = Field(None, ge=0, description="Number of comments on the post")
    upvotes: Optional[int] = Field(None, description="Net upvote count (can be negative for heavily downvoted posts)")


class KeyPoint(BaseModel):
    point: str = Field(description="Specific insight or takeaway")
    sentiment: Literal["positive", "negative", "neutral", "mixed"] = Field(
        description="Overall sentiment associated with this point"
    )
    subreddits: List[str] = Field(description="List of subreddits where this point was discussed")


class RelevantLink(BaseModel):
    title: str = Field(description="Title of the external resource")
    url: str = Field(description="URL of the external resource")
    mentions: Optional[int] = Field(None, ge=1, description="Number of times this resource was mentioned")


class DiscussionTopic(BaseModel):
    title: str = Field(description="Concise title that unifies common discussion topics")
    summary: str = Field(description="Comprehensive overview synthesizing discussions from all sources")
    sources: List[Source] = Field(min_items=1, description="Original Reddit posts that discuss this topic")
    keyPoints: List[KeyPoint] = Field(min_items=1, description="Main insights or takeaways from the discussions")
    relevantLinks: Optional[List[RelevantLink]] = Field(None, description="External resources mentioned in the discussions")
    overallSentiment: Optional[Literal["positive", "negative", "neutral", "mixed"]] = Field(
        None, description="The overall sentiment of discussions on this topic"
    )

class DiscussionTopics(BaseModel):
    output: List[DiscussionTopic] = Field(description="A list of discussion topics.")

discussion_topics_parser = PydanticOutputParser(pydantic_object=DiscussionTopics)

discussion_topics_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a content writer for a Reddit-based newsletter. You will be given a focus, a theme and a selected list of Reddit discussions. Your task is to:
    1. Analyze these discussions to identify a unified topic that encompasses all of them. It must be related to the focus.
    2. Create a detailed, insightful summary that captures the key points and diverse perspectives
    3. The content must be written in the tone specified.
    4. Structure your response according to the specific JSON format below

    Guidelines:
    - Provide depth and specificity, avoiding generic summaries
    - Include relevant links appropriately
    - Omit personal information such as usernames where possible
    - Analyze the overall sentiment of the discussion
    - Identify and highlight key quotes that represent important viewpoints
    - Extract the most meaningful points that appeared across multiple subreddits

    Return your content as a single topic object in this JSON format:

    ```json
    {
    "title": "Concise, Engaging Title That Unifies the Discussions",
    "summary": "A comprehensive 3-5 sentence overview synthesizing the discussions across all sources, highlighting common themes, points of contention, and notable insights.",
    "sources": [
        {
        "subreddit": "r/SubredditName",
        "postId": "post-id-from-url",
        "postTitle": "Original Reddit Post Title",
        "url": "https://reddit.com/r/SubredditName/comments/post-id",
        "commentCount": 123,
        "upvotes": 456
        }
    ],
    "keyPoints": [
        {
        "point": "Specific insight or takeaway from the discussions",
        "sentiment": "positive/negative/neutral/mixed",
        "subreddits": ["r/SubredditOne", "r/SubredditTwo"]
        }
    ],
    "relevantLinks": [
        {
        "title": "Title of external resource mentioned multiple times",
        "url": "https://example.com/resource",
        "mentions": 5
        }
    ],
    "overallSentiment": "positive/negative/neutral/mixed",
    }
    ```
     
    Important notes:
    - For each unified topic, create exactly ONE object with the structure above
    - The content you provide will be added to an array of similar topic objects
    - Ensure all required fields (title, summary, sources, keyPoints) are included
    - The title must NOT be vague
    - Include at least one source and one key point
    - Each source must have subreddit, postId, postTitle, and url at minimum
    - Each keyPoint must have point, sentiment, and subreddits
    - Use only "positive", "negative", "neutral", or "mixed" for sentiment values

    Remember to maintain a neutral, journalistic tone while accurately representing the full spectrum of viewpoints present in the discussions.

    REMEMBER TO ALWAYS USE format_final_response at the end of every response.
    """),
    ("human", "Focus: {focus}\nTheme: {theme}\n Tone: {tone}\n Selected discussions: {discussions}"),
])

def parse_chain_output(llm_output, parser):
    """
    Parse the output of a chain.
    """
    content = llm_output.content if hasattr(llm_output, 'content') else str(llm_output)
    return parser.parse(content)

def write_summary(focus, theme, tone, discussions):
    """
    Write a summary for a given focus, theme, and tone.
    """
    llm = choose_model(MODEL_NAME)
    chain = discussion_topics_prompt | llm

    with get_openai_callback() as cb:
        chain_output = chain.invoke({"focus": focus, "theme": theme, "tone": tone, "discussions": discussions})

    # Parse the output and keep the Pydantic model
    discussion_topics_data = parse_chain_output(chain_output, discussion_topics_parser)

    # Return the Pydantic models with their output attributes intact
    result = discussion_topics_data.model_dump().get("output")

    print("-"*100)
    print(f"Total Tokens: {cb.total_tokens}")
    print(f"Prompt Tokens: {cb.prompt_tokens}")
    print(f"Completion Tokens: {cb.completion_tokens}")
    print(f"Total Cost (USD): ${cb.total_cost}")
    print("-"*100)

    return result
    
