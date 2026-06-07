from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    superadmin_email: str = "admin@catalogo.app"
    superadmin_password: str = "admin123"
    frontend_url: str = "http://localhost:5173"

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()
