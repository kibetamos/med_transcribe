import os
import speech_recognition as sr
from pydub import AudioSegment

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
        print("Converting audio to WAV format...")
        audio = AudioSegment.from_file(file_path)
        file_path = file_path.replace(file_path.split(".")[-1], "wav")
        audio.export(file_path, format="wav")

    # Load the audio file and get its duration
    audio = AudioSegment.from_wav(file_path)
    total_duration = len(audio) / 1000  # Convert to seconds
    transcription = []

    # Split and transcribe in chunks
    for start in range(0, int(total_duration), chunk_duration):
        print(f"Processing chunk: {start} to {start + chunk_duration} seconds")
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

# Test the function
if __name__ == "__main__":
    audio_file = input("Enter the path to your audio file (e.g., audio.mp3): ")
    if os.path.exists(audio_file):
        print("Loading audio...")
        transcription = transcribe_audio(audio_file)
        print("\nTranscription:\n", transcription)
    else:
        print("File not found. Please check the path and try again.")
