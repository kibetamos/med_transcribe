from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
from pydub import AudioSegment
import os
import speech_recognition as sr

# Initialize FastAPI app
app = FastAPI()

# Directory to save uploaded files
UPLOAD_FOLDER = "uploaded_files"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def transcribe_audio(file_path, chunk_duration=60):
    """
    Transcribes an audio file using Google Speech Recognition.
    Handles non-WAV formats by converting them and splits large files into chunks.

    Args:
        file_path (str): Path to the audio file.
        chunk_duration (int): Duration (in seconds) of each chunk for long files.

    Returns:
        str: Transcribed text from the audio.
    """
    recognizer = sr.Recognizer()

    # Convert non-WAV files to WAV
    if not file_path.endswith(".wav"):
        audio = AudioSegment.from_file(file_path)
        file_path = file_path.replace(file_path.split(".")[-1], "wav")
        audio.export(file_path, format="wav")

    # Load the audio file and get its duration
    audio = AudioSegment.from_wav(file_path)
    total_duration = len(audio) / 1000  # Convert to seconds
    transcription = []

    # Split and transcribe in chunks
    for start in range(0, int(total_duration), chunk_duration):
        chunk = audio[start * 1000:(start + chunk_duration) * 1000]
        chunk.export("temp_chunk.wav", format="wav")

        with sr.AudioFile("temp_chunk.wav") as source:
            audio_data = recognizer.record(source)

        try:
            text = recognizer.recognize_google(audio_data)
            transcription.append(text)
        except sr.UnknownValueError:
            transcription.append("[Unintelligible]")
        except sr.RequestError as e:
            return f"API unavailable or error: {e}"

    # Clean up temporary chunk file
    if os.path.exists("temp_chunk.wav"):
        os.remove("temp_chunk.wav")

    return " ".join(transcription)

@app.post("/transcribe/")
async def transcribe_audio_file(file: UploadFile, save_transcription: bool = Form(False)):
    """
    Endpoint to transcribe an uploaded audio file.

    Args:
        file (UploadFile): The uploaded audio file.
        save_transcription (bool): Whether to save the transcription to a file.

    Returns:
        JSONResponse: Contains the transcription or an error message.
    """
    try:
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Transcribe the audio
        transcription = transcribe_audio(file_path)

        # Optionally save the transcription
        if save_transcription:
            transcription_file = file_path.replace(file.filename.split(".")[-1], "txt")
            with open(transcription_file, "w") as f:
                f.write(transcription)

        return JSONResponse(content={"transcription": transcription, "status": "success"})

    except Exception as e:
        return JSONResponse(content={"error": str(e), "status": "failure"}, status_code=500)
    finally:
        # Cleanup uploaded files
        if os.path.exists(file_path):
            os.remove(file_path)

@app.get("/health/")
def health_check():
    """
    Health check endpoint to verify the API is running.

    Returns:
        JSONResponse: A message confirming the API is operational.
    """
    return JSONResponse(content={"message": "API is running", "status": "success"})

# Run the application using Uvicorn (or another ASGI server)
# Command: uvicorn audio_transcription_api:app --reload


