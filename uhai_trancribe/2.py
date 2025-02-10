import os
import speech_recognition as sr
from pydub import AudioSegment, effects

def preprocess_audio(file_path):
    """
    Converts audio to WAV, normalizes volume, converts to mono.
    """
    audio = AudioSegment.from_file(file_path)
    audio = audio.set_channels(1)  # Convert to mono
    audio = effects.normalize(audio)  # Normalize volume
    wav_path = file_path.rsplit(".", 1)[0] + ".wav"
    audio.export(wav_path, format="wav")
    return wav_path

def transcribe_audio(file_path, chunk_duration=20, overlap=4):
    """
    Transcribes an audio file using Google Speech Recognition with better accuracy.

    Args:
        file_path (str): Path to the audio file.
        chunk_duration (int): Duration (in seconds) of each chunk.
        overlap (int): Overlap between chunks to capture cut-off words.

    Returns:
        str: Transcribed text from the audio.
    """
    recognizer = sr.Recognizer()
    file_path = preprocess_audio(file_path)  # Preprocess first
    audio = AudioSegment.from_wav(file_path)
    total_duration = len(audio) / 1000  # Convert to seconds
    transcription = []

    # Split and transcribe in chunks with overlap
    start = 0
    while start < total_duration:
        end = min(start + chunk_duration, total_duration)
        print(f"Processing chunk: {start} to {end} seconds")

        chunk = audio[start * 1000:end * 1000]  # Extract chunk
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

        start += chunk_duration - overlap  # Move forward with overlap

    # Clean up temporary files
    os.remove("temp_chunk.wav")
    return " ".join(transcription)

# Example Usage
if __name__ == "__main__":
    audio_file = input("Enter the path to your audio file: ")
    if os.path.exists(audio_file):
        transcription = transcribe_audio(audio_file)
        print("\nTranscription:\n", transcription)
    else:
        print("File not found. Check the path and try again.")
