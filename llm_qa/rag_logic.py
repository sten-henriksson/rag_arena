import asyncio
from dotenv import load_dotenv
from fastapi import WebSocket
import uuid
import json
from llm_module import AzureChatHelper, AzureChatHelperAssistant,AzureEmbeddingHelper,AzureSearchHelper, LlmHelper,rerank_hook,prerank_hook, SensitiveDataError, preprocess_texts_to_second_sentence,create_highlighted_urls_with_ids
import logging
# Configure logging
logging.basicConfig(level=logging.CRITICAL, format='%(asctime)s - %(levelname)s - %(message)s', filename='app.log', filemode='w')
import os
from telemetrics import create_connection, save_data_log

load_dotenv()  # Load environment variables from .env file
chat_helper = AzureChatHelper("./system_message.txt")
search = AzureSearchHelper()
embedding = AzureEmbeddingHelper()

async def start_rag(websocket: WebSocket, data: str):
    text = ""
    _uuid = uuid.uuid1()
    followupQ = ""
    try:
        # filter away sensitive data
        data = prerank_hook(data)
        # if its the first question in the convo 
        if(data.count('user:')>1):
            #followupQ = AzureChatHelperAssistant("./prerank.txt").run(extract_last_user(data))
            #if(followupQ != "False"):
                #logging.info(f"UserIntent Before: {data}")
                #data = AzureChatHelperAssistant("./userintent.txt").run(data) 
                #logging.info(f"UserIntent After: {data}")
            print("Is a followup")
        else:
            logging.critical(f"First question: {followupQ}")
        
        if data != False:
            documents_with_ids = []
            preprocessed_contents = []
            highlighted_urls = []
            breadcrumbs_string = []
            logging.critical(f"Data:"+extract_last_user(data))
            
            documents_with_ids = search.run( embedding.run(extract_last_user(data)), "contentVector")
            reranked_documents = rerank_hook(data, documents_with_ids)
            
            # Preprocess content and generate highlighted URLs only once per message
            top_documents_content = [doc['content'] for doc in reranked_documents]
            preprocessed_contents = preprocess_texts_to_second_sentence(top_documents_content)
            top_document_urls = [doc['url'] for doc in reranked_documents]
            document_ids = [str(uuid.uuid4()) for _ in reranked_documents]  # Example generation
            highlighted_urls = create_highlighted_urls_with_ids(top_document_urls, preprocessed_contents, document_ids)
            top_document_titles = [doc['title'] for doc in reranked_documents]
            breadcrumbs = [doc['breadcrumbs'] for doc in reranked_documents]

            # Adding a note for clarity on AI-generated URLs"
            urls_string = "\n".join(highlighted_urls)
            title_string = "\n".join(top_document_titles)
            content_string = "\n".join(preprocessed_contents)
            breadcrumbs_string = "\n".join(breadcrumbs)
            # Data will contain entire chathistory
            question = f"system prompt:{chat_helper.sys_prompt} \n \n {data} \n documents:({content_string})\n Related URLs:\n{urls_string}\nURLs Titles:\n{title_string}\n Breadcrumbs:\n{breadcrumbs_string} "
            logging.critical(f"\n \n \n \nLog:"+question+"\n \n \n \n")
            

            waifu = LlmHelper()
            text = waifu.run(question)
            await websocket.send_text(json.dumps({"end": "false", "debug": "false", "uuid": str(_uuid), "body": text}))
            
            save_data_log({"system_prompt": chat_helper.sys_prompt,
                "question": data,
                "documents": str(preprocessed_contents),
                "uuid": str(_uuid),
                "answer": str(text),
                "url": str(highlighted_urls),
                "breadcrumbs": str(breadcrumbs_string),
                "GPT_DEPLOYMENT_NAME": os.getenv("GPT_DEPLOYMENT_NAME"),
                "OPENAI_SEARCH_NAME": os.getenv("OPENAI_SEARCH_NAME"),
                "OPENAI_EMBEDDING_NAME": os.getenv("OPENAI_EMBEDDING_NAME")})
                
                # Ensure AI-generated note is included in the log for clarity
            if(followupQ == "False"):
                debug_q_res = json.dumps({
                    "system_prompt": chat_helper.sys_prompt,
                    "question": data,
                    "documents": [],
                    "uuid": str(_uuid),
                    "answer": "",
                    "url": [],
                    "breadcrumbs": []
                })

                await websocket.send_text(json.dumps({"end": "true", "debug": "false", "uuid": str(_uuid), "body": debug_q_res}))
            else:
                debug_q = json.dumps({
                    "system_prompt": chat_helper.sys_prompt,
                    "question": data,
                    "documents": preprocessed_contents,
                    "uuid": str(_uuid),
                    "answer": text,
                    "url": highlighted_urls,
                    "breadcrumbs": breadcrumbs_string,
                    "GPT_DEPLOYMENT_NAME": os.getenv("GPT_DEPLOYMENT_NAME"),
                    "OPENAI_SEARCH_NAME": os.getenv("OPENAI_SEARCH_NAME"),
                    "OPENAI_EMBEDDING_NAME": os.getenv("OPENAI_EMBEDDING_NAME")
                })
                debug_q_res = {"end": "true", "debug": "false", "uuid": str(_uuid), "body": debug_q}
                # Save to DB (Telemetry)
                await websocket.send_text(json.dumps(debug_q_res))
        else:
            await send_custom_message(websocket, _uuid, "Cannot process the request due to internal conditions.")
    except SensitiveDataError:
        print("SensitiveDataError caught, sending custom message.")
        # Handle sensitive data error by sending a custom message
        await send_custom_message(websocket, _uuid, """### Säkerhetsmeddelande

        Av säkerhetsskäl har din fråga **inte skickats** eftersom den verkar innehålla känslig information
        (t.ex. personnummer eller e-post). Vi ber dig vänligen att:

        - Skicka frågan igen
        - Kontrollera att **ingen känslig information** har angivits

        Tack för din förståelse.""")

async def send_custom_message(websocket, _uuid, message, suppress_feedback=False):
    message_content = {
        "end": "false",  # Default to allowing feedback
        "uuid": str(_uuid),
        "body": message,
    }
    if suppress_feedback:
        message_content["end"] = "true"  # Suppress the feedback box on the frontend

def extract_last_user(input_string: str) -> str:
    """
    Extracts the portion of the input string that comes after the last occurrence of "user:".

    Args:
        input_string (str): The input string from which to extract the information.

    Returns:
        str: The substring that comes after the last occurrence of "user:", or an empty string
        if "user:" is not found in the input string.
    """
    # Find the last occurrence of "user:"
    last_user_index = input_string.rfind("user:")

    # If "user:" was not found, return an empty string
    if last_user_index == -1:
        return ""

    # Extract and return the substring from the last occurrence of "user:" to the end
    return input_string[last_user_index:]