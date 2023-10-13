# Shorty

A dead simple URL shortener.

## Usage

Deploy with docker or kubernetes, port 3000.

### Environment variables

- `DEFAULT_ADMIN_API_KEY`: The API key of the admin account created automatically.
- `DATABASE_URL`: The database url.

Accounts are currently created manually in the database. The first account created automatically will be the admin account which has its API key specified in the `DEFAULT_ADMIN_API_KEY` environment variable.

### API

#### Create a short link

```HTML
POST /shorten
```

Request body:

```json
{
  "url": "https://example.com",
  "id": "example"
}
```

This will create a short link with the ID `example` that redirects to `https://example.com`.

Sending a request without the id will generate a random id.

#### Get a short link

```HTML
GET /:id
```

This will redirect to the URL associated with the ID `:id`.
