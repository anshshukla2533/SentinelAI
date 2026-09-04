from pydantic import BaseModel


class InstallerConfig(BaseModel):
    server_url: str
    api_key: str
    hostname: str

