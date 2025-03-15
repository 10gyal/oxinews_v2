
import logging
import langchain
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from langchain_core.runnables import RunnableSequence

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
class ThemeSelectorFormat(BaseModel):
    """A collection of themes."""
    output: List[str] = Field(description="A list of themes. Each theme should be a single title without any secondary titles. Do not use **title-subtitle** format.")

# Create the output parser
theme_selector_parser = PydanticOutputParser(pydantic_object=ThemeSelectorFormat)

# Define the prompt
theme_selector_prompt = ChatPromptTemplate.from_messages([
    ("system", """You will receive a curated collection of Reddit posts along with a specific focus topic. Your task is to analyze these posts and develop a list of 5-10 themes that encapsulate the most interesting content directly related to the focus topic.

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


# Define the agent
# theme_selector_agent = theme_selector_prompt | choose_model("gemini-2.0-flash-lite")
llm = choose_model("gemini-2.0-flash")

# Define the function to select themes
def select_themes(posts, focus, tone="Professional"):
    """
    Select and group related posts based on focus topic and tone.

    Args:
        posts (List[Dict]): A list of dictionaries containing post data
        focus (str): The focus topic
        tone (str): The tone of the posts
        
    """
    try:
        # Preprocess post_data to format expected by prompt
        post_contents = [item['post_content'] for item in posts]
        
        # Set format instructions
        format_instructions = theme_selector_parser.get_format_instructions()

        # Create a RunnableSequence for the agent
        theme_selector_agent = theme_selector_prompt | llm

        # Call the agent
        result = theme_selector_agent.invoke({
            "format_instructions": format_instructions,
            "focus": focus,
            "tone": tone,
            "posts": post_contents
        }) 

        # Parse the result
        content = result.content if hasattr(result, 'content') else str(result)
        output = theme_selector_parser.parse(content).output

        print(output)

        return output
    except Exception as e:
        logging.error(f"Error in select_themes: {str(e)}")
        return []
