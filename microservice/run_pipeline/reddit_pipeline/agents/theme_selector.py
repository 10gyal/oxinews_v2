
import logging
import langchain
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables import RunnableSequence
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# Configure langchain settings
langchain.verbose = False
langchain.debug = False
langchain.llm_cache = False

# Define the language model
def choose_model(model_name):
    if "gpt" in model_name:
        llm = ChatOpenAI(temperature=0, model_name=model_name)
    
    elif "gemini" in model_name:
        llm = ChatGoogleGenerativeAI(temperature=0, model=model_name)

    return llm


# ================================
# Theme Selector
# ================================
class ThemeSelectorFormat(BaseModel):
    """A collection of themes."""
    output: List[str] = Field(description="A list of themes. Each theme should be a single title without any secondary titles. Do not use **title-subtitle** format.")

theme_selector_parser = PydanticOutputParser(pydantic_object=ThemeSelectorFormat)

theme_selector_prompt = ChatPromptTemplate.from_messages([
    ("system", """You will receive a curated collection of Reddit posts along with a specific focus topic. Your task is to analyze these posts and develop a list of themes that encapsulate the most interesting content directly related to the focus topic.

    ### Important Guidelines ###
	- Generate a list of themes that are directly tied to the focus topic, ensuring they will serve as the foundation for distinct content clusters.
	- Each theme must be a single, concise, and powerfully engaging title—crafted specifically for domain experts. 
    - Do NOT use **title-subtitle** format. Each theme must be a single title without any secondary titles.
	- The themes should immediately capture attention, offering precise, dynamic insights without resorting to generic or overly broad language.
	- Your ultimate goal is to create a list of themes that transforms the material into an exciting, expert-level narrative.
     
    {format_instructions}
    """),
    ("human", "Focus Topic: {focus}\nTone: {tone}\n\nList of posts: {posts}"),
])

# ================================
# Post Selector
# ================================
class RelatedPostGroup(BaseModel):
    """A group of related posts that are talking about the same topic."""
    title: str = Field(
        description="A title that is specific, insightful and relevant to the focus topic."
    )
    related_post_ids: List[str] = Field(
        description="Array of post unique post IDs that are related and are talking about the same topic."
    )

class PostSelectorFormat(BaseModel):
    """A collection of related post groups."""
    output: List[RelatedPostGroup] = Field(description="A list of related post groups.")

post_selector_parser = PydanticOutputParser(pydantic_object=PostSelectorFormat)

post_selector_prompt = ChatPromptTemplate.from_messages([
    ("system", """You will be given a list of posts from Reddit along with a topic to focus on. Your task is to go through each post and identify those that are relevant to the focus topic. Group related posts under a common title that concisely summarizes their shared theme. The shared theme must not be generic. It must be specific and insightful.
    {format_instructions}
    """),
    ("human", "Focus Topic: {focus}\nList of {{post_id: post_content}} pairs:\n{posts_objects}"),
])


def parse_chain_output(llm_output, parser):
    """
    Parse the output of a chain.
    """
    content = llm_output.content if hasattr(llm_output, 'content') else str(llm_output)
    return parser.parse(content)


def aggregate_posts(posts, focus, tone="Professional"):
    """
    Aggregate posts into a list of related post groups.

    Args:
        posts (List[Dict]): A list of dictionaries containing post data
        focus (str): The focus topic
        tone (str): The tone of the posts
        
    Returns:
        Dict with:
            - themes: ThemeSelectorFormat object containing output attribute
            - post_groups: PostSelectorFormat object containing output attribute
    """
    llm = choose_model("gemini-2.0-flash-lite")

    # Extract post contents for the theme selector
    post_contents = [post["post_content"] for post in posts]
    
    # Create post objects for the post selector
    post_objects = {}
    for post in posts:
        post_objects[post["post_id"]] = post["post_content"]
    
    # Run the theme selector chain
    # theme_chain = RunnableSequence(
    #     {
    #         "format_instructions": lambda _: theme_selector_parser.get_format_instructions(),
    #         "focus": lambda x: x["focus"],
    #         "tone": lambda x: x["tone"],
    #         "posts": lambda x: x["post_contents"]
    #     } | theme_selector_prompt | llm
    # )
    
    # theme_chain_output = theme_chain.invoke(
    #     {
    #         "focus": focus,
    #         "tone": tone,
    #         "post_contents": post_contents
    #     }
    # )
    
    # Parse the theme output and keep the Pydantic model
    # themes_data = parse_chain_output(theme_chain_output, theme_selector_parser)
    
    # Run the post selector chain
    post_chain = RunnableSequence(
        {
            "format_instructions": lambda _: post_selector_parser.get_format_instructions(),
            "focus": lambda x: x["focus"],
            "tone": lambda x: x["tone"],
            "posts_objects": lambda _: post_objects
        } | post_selector_prompt | llm
    )
    
    post_chain_output = post_chain.invoke({
        "focus": focus,
        "tone": tone,
        "posts_objects": post_objects
    })
    
    # Parse the post selector output and keep the Pydantic model
    post_groups_data = parse_chain_output(post_chain_output, post_selector_parser)
    
    # Return the Pydantic models with their output attributes intact
    result = post_groups_data.model_dump().get("output")

    return result