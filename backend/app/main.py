from fastapi import FastAPI

app = FastAPI(title="TuneScope API")


@app.get("/health")
def health():
    return {"status": "ok"}
