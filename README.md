# MEAN API - Laboratorium 6

Serwer REST napisany w Node.js, TypeScript i Express. Dane postow sa
przechowywane w MongoDB za posrednictwem Mongoose.

## Uruchomienie

Wymagany jest Node.js, npm i dzialajacy serwer MongoDB. Zainstaluj zaleznosci
i uruchom aplikacje:

```powershell
npm install
npm run watch
```

`npm run watch` uruchamia nodemon i restartuje serwer po zmianach plikow
TypeScript w `lib/`. Pozostale polecenia:

```powershell
npm run dev       # uruchomienie przez ts-node
npm start         # uruchomienie przez ts-node
npm run build     # kompilacja do dist/
```

Domyslnie aplikacja laczy sie z lokalna baza
`mongodb://127.0.0.1:27017/mean-app` i nasluchuje na porcie `3100`.
Wlasny adres bazy ustaw przez zmienna srodowiskowa `MONGODB_URI`, a port przez
`PORT` (1-65535). Przyklad w PowerShell:

```powershell
$env:MONGODB_URI = "mongodb+srv://<uzytkownik>:<haslo>@<klaster>/<baza>"
$env:PORT = "3200"
npm run watch
```

Nie zapisuj danych logowania do MongoDB w kodzie ani w repozytorium. Serwer
zaczyna nasluchiwac dopiero po nawiazaniu polaczenia z baza; jesli polaczenie
sie nie powiedzie, blad jest wypisywany w konsoli i aplikacja nie startuje.
`Ctrl+C` zamyka polaczenie z baza.

## API postow

Post zawiera wymagane pola `title`, `text` i `image`, wszystkie typu string.
Postman: dla POST wybierz **Body -> raw -> JSON**.

| Metoda | Sciezka | Dzialanie |
| --- | --- | --- |
| GET | `/api/posts` | Zwraca wszystkie posty. |
| GET | `/api/post/latest` | Alias zwracajacy wszystkie posty. |
| GET | `/api/post/:id` | Zwraca post po MongoDB ObjectId. |
| POST | `/api/post` | Tworzy post. |
| POST | `/api/post/:num` | Zwraca post o indeksie `num`; middleware akceptuje liczby 1-14. |
| DELETE | `/api/post/:id` | Usuwa post po MongoDB ObjectId. |
| DELETE | `/api/posts` | Usuwa wszystkie posty. |

Przyklad utworzenia postu:

```http
POST http://localhost:3100/api/post
Content-Type: application/json

{"title":"Pierwszy post","text":"Tresc","image":"post.jpg"}
```

Niepoprawne dane lub identyfikator zwracaja `400 Bad Request`, brak postu
zwraca `404 Not Found`, a nieoczekiwany blad serwera `500 Internal Server
Error`.

## Struktura

- `lib/app.ts` konfiguruje Express, polaczenie z MongoDB i bezpieczne
  zamykanie aplikacji.
- `lib/config.ts` przechowuje konfiguracje portu, limitu i adresu bazy danych.
- `lib/controllers/post.controller.ts` obsluguje endpointy postow.
- `lib/middlewares/checkPostCount.middleware.ts` waliduje parametr `num`.
- `lib/middlewares/requestLogger.middleware.ts` loguje kazde zapytanie HTTP.
- `lib/modules/models/` i `lib/modules/schemas/` definiuja dane oraz schemat
  Mongoose.
- `lib/modules/services/data.service.ts` realizuje operacje CRUD w MongoDB.
