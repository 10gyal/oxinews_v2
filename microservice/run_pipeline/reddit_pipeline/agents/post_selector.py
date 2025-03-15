"""
This module contains the code for the post selector agent.

It will receive a list of posts and a focus topic from reddit_retrieval.py.
"""

import logging
import langchain
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
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

# Define the output parser
class RelatedPostGroup(BaseModel):
    """A group of related posts that are talking about the same topic."""
    title: str = Field(
        description="A title that concisely summarizes the posts that are related."
    )
    related_post_ids: List[str] = Field(
        description="Array of post IDs that are related and are talking about the same topic."
    )

class PostSelectorFormat(BaseModel):
    """A collection of related post groups."""
    output: List[RelatedPostGroup]
    

# Create the output parser
post_selector_parser = PydanticOutputParser(pydantic_object=PostSelectorFormat)

# Define the prompt
post_selector_prompt = ChatPromptTemplate.from_messages([
    ("system", """You will be given a list of posts from Reddit along with a topic to focus on. Your task is to go through each post and identify those that are relevant to the focus topic. Group related posts under a common title that concisely summarizes their shared theme. The shared theme must not be generic. It must be specific and insightful.
     
    Return the results in the following format:
    {format_instructions}
    """),
    ("human", "Focus Topic: {focus}\nTone: {tone}\n\nList of posts: {post_objects}"),
])

# Define the agent
post_selector_agent = post_selector_prompt | choose_model("gemini-2.0-flash-lite")

# Define the function to select posts
def select_posts(post_data, focus, tone="Professional"):
    """
    Select and group related posts based on focus topic and tone.
    
    Args:
        post_data (list): List of dictionaries with post_id and post_content keys
        focus (str): The focus topic to filter and group posts by
        tone (str, optional): The tone for content selection. Defaults to "Professional".
        
    Returns:
        list: List of RelatedPostGroup objects
    """
    try:
        # Preprocess post_data to format expected by prompt
        post_objects = {item['post_id']: item['post_content'] for item in post_data}
        
        # Set format instructions
        format_instructions = post_selector_parser.get_format_instructions()
        
        # Invoke the agent with the processed data
        result = post_selector_agent.invoke({
            "focus": focus, 
            "tone": tone, 
            "post_objects": post_objects,
            "format_instructions": format_instructions
        })
        
        # Parse the result
        content = result.content if hasattr(result, 'content') else str(result)

        print(f"Result: {content}")
        return post_selector_parser.parse(content)
    except Exception as e:
        logging.error(f"Error in select_posts: {str(e)}")
        return []
