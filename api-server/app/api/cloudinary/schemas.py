from pydantic import BaseModel, Field, HttpUrl


class CloudinaryUploadData(BaseModel):
    secure_url: HttpUrl
    public_id: str
    resource_type: str
    format: str | None = None
    bytes: int | None = Field(default=None, ge=0)
    original_filename: str | None = None
    asset_id: str | None = None
    width: int | None = Field(default=None, ge=0)
    height: int | None = Field(default=None, ge=0)


class CloudinaryUploadResponse(BaseModel):
    success: bool = True
    message: str = "File uploaded successfully"
    data: CloudinaryUploadData
