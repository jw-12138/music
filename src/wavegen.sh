ffmpeg -i audio.mp3 -filter_complex "showwavespic=s=3600x460:colors=#d9d9d9" -frames:v 1 wave.png