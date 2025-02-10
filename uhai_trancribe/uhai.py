import os
import logging
from cryptography.fernet import Fernet
from concurrent.futures import ThreadPoolExecutor
import speech_recognition as sr
from pydub import AudioSegment

# Initialize logging
logging.basicConfig(filename="transcription_log.txt", level=logging.INFO)

# Initialize encryption
key = Fernet.generate_key()
cipher_suite = Fernet(key)

def transcribe_audio(file_path, chunk_duration=60):
    recognizer = sr.Recognizer()

    # Convert non-WAV files to WAV
    if not file_path.endswith(".wav"):
        logging.info("Converting audio to WAV format...")
        audio = AudioSegment.from_file(file_path)
        file_path = file_path.replace(file_path.split(".")[-1], "wav")
        audio.export(file_path, format="wav")

    # Load the audio file
    audio = AudioSegment.from_wav(file_path)
    total_duration = len(audio) / 1000  # Convert to seconds
    transcription = []

    def process_chunk(start):
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
            logging.error(f"API request failed: {e}")

    # Use multi-threading for parallel processing
    with ThreadPoolExecutor() as executor:
        executor.map(process_chunk, range(0, int(total_duration), chunk_duration))

    # Clean up temporary chunk file
    if os.path.exists("temp_chunk.wav"):
        os.remove("temp_chunk.wav")

    # Encrypt transcription
    encrypted_transcription = cipher_suite.encrypt(" ".join(transcription).encode())
    return encrypted_transcription

def save_transcription_to_file(transcription, output_path):
    """
    Saves the transcription to a text file.

    Args:
        transcription (str): The transcribed text.
        output_path (str): Path to save the transcription file.
    """
    with open(output_path, "w") as file:
        file.write(transcription)
    print(f"Transcription saved to: {output_path}")

# Example usage
if __name__ == "__main__":
    audio_file = input("Enter the path to your audio file: ")
    if os.path.exists(audio_file):
        # Transcribe the audio (returns encrypted transcription)
        encrypted_transcription = transcribe_audio(audio_file)

        # Decrypt the transcription
        decrypted_transcription = cipher_suite.decrypt(encrypted_transcription).decode()

        # Print the transcription to the console
        print("\nTranscription:\n", decrypted_transcription)

        # Save the transcription to a file
        output_file = input("Enter the path to save the transcription (e.g., transcription.txt): ")
        save_transcription_to_file(decrypted_transcription, output_file)
    else:
        print("File not found.")