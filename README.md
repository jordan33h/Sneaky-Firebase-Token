# Sneaky Firebase Token

Sneaky way to obtain Firebase Authentication Result (ID Token) in Firebase Functions, for backend testing or whatever.

### POST /login

So far only email login supported at this moment, which is more than enough for testing.

##### Header

```
Content-Type: application/json
```



##### Request Body

```
{
  "app": {
    "apiKey": (string) {FIREBASE_API_KEY},
    "projectId": (string) {FIREBASE_PROJECT_ID},
    "messagingSenderId": (integer) {FIREBASE_GCM_ID},
    "authDomain": (string) {FIREBASE_AUTH_DOMAIN}
  },
  "data": {
    "identity": (string),
    "password": (string)
  }
}
```



##### Response Body

```
{
    "user": {
        "uid": (string),
        "displayName": (string),
        "photoURL": (string),
        "email": (string),
        "providerData": [......],
        "stsTokenManager": {
            "refreshToken": (string) {FIREBASE_REFRESH_TOKEN},
            "accessToken": (string) {FIREBASE_ID_TOKEN},
            ......
       },
       ......
    },
 	......
}
```



##### GET /ping

Response

```
ping
```



