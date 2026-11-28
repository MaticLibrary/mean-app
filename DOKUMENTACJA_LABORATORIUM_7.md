# Dokumentacja zmian - Laboratorium 7

## Cel

Rozbudowa serwera NodeJS/Express o:

- walidację danych w schemacie Mongoose i middleware,
- sprawdzanie identyfikatora MongoDB,
- aktualizację danych metodami PUT i PATCH,
- paginację i sortowanie,
- wyszukiwanie po `title` i `text`,
- statystyki kolekcji,
- centralną obsługę błędów.

## 1. Model danych

**Plik:** `lib/modules/models/data.model.ts`

Dodano pola opcjonalne:

- `createdAt?: Date`
- `updatedAt?: Date`

Są opcjonalne w interfejsie, ponieważ Mongoose dodaje je automatycznie dzięki opcji `timestamps: true`.

## 2. Schemat Mongoose

**Plik:** `lib/modules/schemas/data.schema.ts`

Zaktualizowano pole `title`:

- `required` - tytuł jest obowiązkowy,
- `trim` - usuwa białe znaki z początku i końca,
- `unique` - tytuł nie może się powtarzać,
- `minlength: 3`,
- `maxlength: 100`.

Pole `text` jest wymagane i przycinane, natomiast `image` musi być wymaganym tekstem zaczynającym się od `http://` lub `https://`.

Opcja `{ timestamps: true }` automatycznie tworzy i aktualizuje `createdAt` oraz `updatedAt`.

Nazwa modelu `Post-RKK` została zachowana, aby nie utworzyć nowej, pustej kolekcji zamiast istniejącej.

## 3. Middleware sprawdzające ObjectId

**Plik:** `lib/middlewares/checkObjectId.middleware.ts`

Middleware używa `isObjectIdOrHexString(id)`.

- poprawny identyfikator 24-znakowy -> `next()`,
- niepoprawny identyfikator -> HTTP 400 i komunikat `Niepoprawny identyfikator!`.

Zastosowano go przed `GET /:id`, `PUT /:id`, `PATCH /:id` i `DELETE /:id`, dzięki czemu zapytanie błędne nie trafia do MongoDB.

## 4. Walidacja POST i PATCH

**Pliki:**

- `lib/middlewares/validatePost.middleware.ts`
- `lib/middlewares/validatePatch.middleware.ts`

`validatePost` sprawdza pełny obiekt POST i zwraca listę wszystkich błędów naraz:

- `title`: tekst o długości 3-100 znaków,
- `text`: niepusty tekst,
- `image`: poprawny adres URL.

`validatePatch` sprawdza tylko przesłane pola, odrzuca pola spoza `title`, `text`, `image` i wymagane co najmniej jedno pole do zmiany.

## 5. Warstwa serwisu

**Plik:** `lib/modules/services/data.service.ts`

Serwis odpowiada za komunikację z Mongoose i nie obsługuje bezpośrednio HTTP.

Dodane/metody zaktualizowane:

- `createPost` - tworzy dokument,
- `getById` - pobiera dokument według identyfikatora,
- `updateById` - aktualizuje dokument z `new: true` i `runValidators: true`,
- `getPaginated` - wykonuje równolegle pobranie strony i liczbę wszystkich dokumentów,
- `search` - escapuje frazę i wyszukuje ją w `title` lub `text`, bez rozróżniania wielkości liter,
- `getStats` - agreguje liczbę dokumentów, najstarszą i najnowszą datę.

Wszystkie odpowiedzi danych korzystają z projekcji bez pola `__v`. Pole `_id` pozostaje dostępne dla klienta.

## 6. Endpointy kontrolera

**Plik:** `lib/controllers/post.controller.ts`

| Metoda | Ścieżka | Funkcja |
|---|---|---|
| GET | `/api/post/page?page=1&limit=5&sort=title&order=asc` | Paginacja i sortowanie |
| GET | `/api/post/search?q=angular` | Wyszukiwanie po tytule i treści |
| GET | `/api/post/stats` | Statystyki kolekcji |
| GET | `/api/post/:id` | Jeden dokument |
| POST | `/api/post` | Dodanie dokumentu |
| PUT | `/api/post/:id` | Pełna aktualizacja wszystkich pól |
| PATCH | `/api/post/:id` | Częściowa aktualizacja przesłanych pól |
| DELETE | `/api/post/:id` | Usunięcie dokumentu |

Stałe ścieżki `/page`, `/search` i `/stats` są zarejestrowane przed `/ :id`, aby Express nie traktował ich jako wartości identyfikatora.

Paginacja ogranicza:

- `page` do co najmniej 1,
- `limit` do maksymalnie 50,
- sortowanie do pól `title` i `createdAt`.

## 7. Centralna obsługa błędów

**Pliki:**

- `lib/middlewares/errorHandler.middleware.ts`
- `lib/app.ts`

Kontrolery przekazują błędy przez `next(error)`. Middleware `errorHandler` jest zarejestrowany po kontrolerach i tłumaczy typy błędów:

- błąd walidacji Mongoose -> HTTP 400,
- duplikat klucza MongoDB, kod `11000` -> HTTP 409,
- błędy wewnętrzne -> HTTP 500.

Brak dokumentu przy aktualizacji lub usunięciu jest obsługiwany jako HTTP 404.

## 8. Stan wdrożenia

Zrealizowane elementy konspektu:

- schemat i pola czasu,
- sprawdzanie `ObjectId`,
- walidacja POST,
- walidacja pól PATCH,
- aktualizacja PUT i PATCH,
- paginacja i sortowanie,
- wyszukiwanie,
- centralna obsługa błędów,
- 404 dla brakujących dokumentów,
- unikalny tytuł i odpowiedź 409,
- statystyki kolekcji.

## 9. Weryfikacja

Wykonano kompilację:

```powershell
npm run build
```

Rezultat: kompilacja zakończyła się poprawnie bez błędów TypeScript.
