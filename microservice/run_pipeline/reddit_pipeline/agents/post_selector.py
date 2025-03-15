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
        description="A title that concisely summarizes the posts that are related. Do not use a primary title: secondary title format or any multi-part titles. This title should capture attention immediately and deliver precise, dynamic insights tailored for domain experts, avoiding any generic or overly broad language."
    )
    related_post_ids: List[str] = Field(
        description="Array of post IDs that are very much related and are talking about the same theme. Make sure there are no duplicates."
    )

class PostSelectorFormat(BaseModel):
    """A collection of related post groups."""
    output: List[RelatedPostGroup]
    

# Create the output parser
post_selector_parser = PydanticOutputParser(pydantic_object=PostSelectorFormat)

# Define the prompt
post_selector_prompt = ChatPromptTemplate.from_messages([
    ("system", """You will be provided with a curated collection of Reddit posts alongside a specific focus topic. Your task is to analyze each post and identify those that directly engage with or expand upon the focus area. 
     
    ### Important ###
    - Organize these posts into distinct clusters, each accompanied by a single, concise, and powerfully engaging title. 
    - Do NOT use a primary title: secondary title format or any multi-part titles. 
    - This title should capture attention immediately and deliver precise, dynamic insights tailored for domain experts, avoiding any generic or overly broad language. 
    - Your ultimate goal is to craft a classification system that transforms the material into an exciting, expert-level narrative.
     
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
        output = post_selector_parser.parse(content).output

        # remove duplicates from the related_post_ids and return the output
        for group in output:
            group.related_post_ids = list(set(group.related_post_ids))

        return output
    except Exception as e:
        logging.error(f"Error in select_posts: {str(e)}")
        return []
