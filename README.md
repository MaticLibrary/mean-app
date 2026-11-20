# MEAN API - Laboratorium 5

## Cel projektu

To niewielki serwer Node.js napisany w TypeScript i oparty na Express. Udostepnia
statyczna strone kontrolna oraz REST API do odczytu, dodawania i usuwania
liczbowych wpisow. Dane sa na razie przechowywane w tablicy w pamieci procesu;
nie sa zapisywane w MongoDB.

## Technologie i zaleznosci

- **Node.js** uruchamia kod JavaScript po stronie serwera.
- **TypeScript** dodaje typy i jest kompilowany do JavaScript przez `tsc`.
- **Express** tworzy aplikacje HTTP, routery i middleware.
- **body-parser** dekoduje przychodzace ciala JSON.
- **Morgan** zapisuje informacje o zapytaniach HTTP w konsoli (`dev`).
- **MongoDB/Mongoose, GraphQL i pozostale biblioteki z `package.json`** sa
  zaleznosciami projektu, ale aktualny kontroler postow ich nie uzywa.

## Struktura projektu

```text
lib/
  app.ts                         konfiguracja aplikacji Express i middleware
  config.ts                      walidacja portu z PORT (domyslnie 3100)
  index.ts                       tworzenie kontrolerow i start serwera
  controllers/
    index.controller.ts          obsluga i wyswietlanie public/index.html
    post.controller.ts           trasy API oraz operacje na testArr
  interfaces/
    controller.interface.ts      wspolny kontrakt kontrolera
public/
  index.html                     prosta strona informujaca o dzialaniu serwera
dist/                            wynik kompilacji TypeScript (generowany)
```

### Przeplyw uruchomienia zapytania

1. `lib/index.ts` tworzy `PostController` oraz `IndexController` i przekazuje
   je do klasy `App`.
2. `lib/app.ts` tworzy aplikacje Express, rejestruje middleware i montuje
   routery kontrolerow.
3. `bodyParser.json()` parsuje JSON przed uruchomieniem handlera trasy, a
   `morgan('dev')` loguje zapytanie i odpowiedz.
4. Router `PostController` jest montowany przed kontrolerem strony. To wazne:
   fallback `GET *` strony nie moze przechwycic zapytan do API.
5. Handler odczytuje parametry URL, query string lub cialo JSON i zwraca
   odpowiedz HTTP w formacie JSON.

Interfejs `Controller` wymaga pola `path` oraz routera Express `router`.
Kontrolery grupuja trasy i obsluge powiazana z dana czescia aplikacji.

## Uruchomienie

Wymagany jest Node.js i npm. W katalogu projektu uruchom:

```powershell
npm install
npm run dev
```

Serwer domyslnie nasluchuje na `http://localhost:3100`. Port mozna zmienic
zmienna srodowiskowa `PORT`, np. w PowerShell:

```powershell
$env:PORT = "3200"
npm run dev
```

Kompilacja TypeScript:

```powershell
npm run build
```

Wynikiem jest katalog `dist/`. `npm run dev` uruchamia bezposrednio
`lib/index.ts` przez `ts-node`.

## Uzywanie API w Postmanie

1. W terminalu w katalogu projektu uruchom `npm run dev` i poczekaj na
   `App listening on the port 3100`. Pozostaw serwer uruchomiony.
2. W Postmanie utworz request, wybierz podana metode, wklej URL i kliknij
   **Send**. Ponizsze requesty mozna wysylac po kolei.
3. Dla POST wybierz **Body -> raw -> JSON** i wklej podane cialo. Postman
   ustawi `Content-Type: application/json`.
4. Odpowiedz i status HTTP zobaczysz w Postmanie. Logi zapytan sa w terminalu
   serwera.

```text
GET    http://localhost:3100/api/posts
GET    http://localhost:3100/api/post/latest
GET    http://localhost:3100/api/post/0
GET    http://localhost:3100/api/posts?limit=3

POST   http://localhost:3100/api/post
Body:
{"elem": 42}

DELETE http://localhost:3100/api/post/16
DELETE http://localhost:3100/api/posts
```

W powyzszym przykladzie wpis dodany przez POST ma indeks `16`, jesli tablica
nie byla wczesniej zmieniana. GET `/api/posts` pozwala sprawdzic aktualny stan.
Usuniecie elementu zmienia indeksy elementow, ktore po nim pozostaly. Ostatni
DELETE czysci cala tablice; po ponownym uruchomieniu serwera pojawia sie
poczatkowe dane testowe. Zatrzymaj serwer przez **Ctrl+C** w jego terminalu.

Jesli dostaniesz `400`, sprawdz format `id`, `limit` albo JSON w Body. `404`
oznacza, ze podany indeks nie istnieje.

## API postow

Wpis to na tym etapie liczba. `id` jest indeksem elementu w tablicy i zaczyna
sie od zera. Przyklad poczatkowej kolekcji:

```json
[4, 5, 6, 3, 5, 3, 7, 5, 13, 5, 6, 4, 3, 6, 3, 6]
```

Poniewaz `/api/post/:id` i `/api/post/:num` maja identyczny wzorzec sciezki,
Express nie moze rozroznic ich na podstawie nazw parametrow. Dlatego liczbe
elementow pobiera sie przez `limit` w query string.

| Metoda | Sciezka | Dzialanie |
| --- | --- | --- |
| GET | `/api/post/latest` | Zwraca cala kolekcje (alias zachowany z wczesniejszego etapu). |
| GET | `/api/post/:id` | Zwraca pojedyncza liczbe pod indeksem `id`. |
| GET | `/api/posts` | Zwraca cala kolekcje. |
| GET | `/api/posts?limit=N` | Zwraca pierwsze `N` elementow; np. `?limit=3`. |
| POST | `/api/post` | Dodaje liczbe z ciala JSON. |
| POST | `/api/post/:id` | Starszy alias dodawania; `id` jest ignorowane, a liczba pochodzi z ciala JSON. |
| DELETE | `/api/post/:id` | Usuwa element pod indeksem `id`. |
| DELETE | `/api/posts` | Usuwa wszystkie elementy i zwraca pusta tablice. |

### Przyklady

Pobranie wszystkich wpisow:

```http
GET http://localhost:3100/api/posts
```

Pobranie elementu o indeksie 2:

```http
GET http://localhost:3100/api/post/2
```

Odpowiedz: `6`.

Pobranie pierwszych trzech elementow:

```http
GET http://localhost:3100/api/posts?limit=3
```

Dodanie liczby (Postman: metoda POST, zakladka Body -> raw -> JSON):

```http
POST http://localhost:3100/api/post
Content-Type: application/json

{"elem": 42}
```

Handler akceptuje rowniez pole `element` dla zgodnosci z wczesniejsza wersja
kontrolera. Odpowiedzia na poprawny POST jest zaktualizowana cala tablica.

Usuniecie elementu o indeksie 2:

```http
DELETE http://localhost:3100/api/post/2
```

Po usunieciu elementow indeksy pozniejszych elementow przesuwaja sie. To
uproszczony model demonstracyjny, a nie stabilne identyfikatory dokumentow.

## Walidacja i odpowiedzi bledow

- `200 OK` oznacza udane pobranie lub usuniecie.
- `400 Bad Request` oznacza niepoprawne `id`, `limit` albo brak liczbowego
  pola `elem`/`element` w JSON.
- `404 Not Found` oznacza poprawny liczbowy indeks, ktory nie wskazuje na wpis.
- Bledny JSON jest odrzucany przez middleware `body-parser`.

`id` oraz `limit` musza byc nieujemnymi liczbami calkowitymi. `limit=0` zwraca
pusta tablice; limit wiekszy od rozmiaru kolekcji zwraca wszystkie dostepne
elementy.

## Istotne pojecia na kolokwium

- **Endpoint** to polaczenie metody HTTP i sciezki, np. `GET /api/posts`.
- **GET** odczytuje dane; **POST** tworzy/dodaje dane; **DELETE** usuwa dane.
- **Parametr sciezki** (`:id`) znajduje sie w URL i jest dostepny przez
  `request.params.id`.
- **Query string** (`?limit=3`) jest dostepny przez `request.query.limit`.
- **Cialo zapytania** dla POST wysylane jako JSON jest dostepne w
  `request.body`; wymaga middleware parsujacego JSON.
- **Middleware** wykonuje sie w lancuchu obslugi Express przed handlerem
  trasy. Kolejnosc rejestracji ma znaczenie.
- **Router** grupuje trasy. Kontroler realizuje obsluge tych tras.
- **HTTP status** informuje klienta, czy operacja sie powiodla (np. 200), czy
  dane byly niepoprawne (400), czy wpis nie istnieje (404).
- Tablica jest ulotna: po restarcie procesu wraca wartosc poczatkowa. Trwala
  baza danych wymagalaby modelu Mongoose i polaczenia z MongoDB; nie jest to
  jeszcze zrealizowane w tym API.
