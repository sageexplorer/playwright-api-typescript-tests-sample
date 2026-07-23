# Test Cases

Two test cases, each mapping one-to-one to an automated spec in `tests/`.

## TC-E2E-01 — Place Order: Register before Checkout

| Field | Value |
| --- | --- |
| Test Case ID | TC-E2E-01 |
| Priority | P1 |
| Type | Functional / End-to-End |
| Scenario | A new user registers, places an order, pays, and deletes the account (site's official Test Case 15) |
| Preconditions | Live site reachable. No account needed — the test registers its own throwaway user (unique email per run) and removes it afterward. |
| Automated in | `tests/place-order.spec.ts` — each step below is a `test.step()` of the same name |

| # | Step | Expected Result |
| --- | --- | --- |
| 1 | Open the home page | Title is "Automation Exercise"; hero slider is visible |
| 2 | Open Signup / Login; submit name and a unique email | "New User Signup!" section shown; "Enter Account Information" form is displayed |
| 3 | Fill account details (gender, password, date of birth, newsletter opt-ins, name, company, address, state, city, zipcode, mobile); create the account | "Account Created!" is displayed; Continue returns to the store |
| 4 | Check the site header | Header shows "Logged in as Sage QA" |
| 5 | Add the first 2 products from the product grid to the cart | Cart modal confirms each addition and closes on "Continue Shopping" |
| 6 | Open the cart via the header | URL is `/view_cart`; cart table lists **exactly 2** products |
| 7 | Proceed to checkout | "Address Details" and "Review Your Order" are shown; the delivery address contains the exact registration data (full name, street, city, mobile); the order review lists **exactly 2** products |
| 8 | Add an order comment; place the order; pay with a test Visa card | Payment form accepts the card data and submits |
| 9 | Observe the confirmation | `/payment_done` page shows "Order Placed!" and "Congratulations! Your order has been confirmed!" (the transient success toast is deliberately not asserted) |
| 10 | Delete the account via the header | "Account Deleted!" is displayed; after Continue, the header shows "Signup / Login" again |

## TC-API-01 — REST API: Contract and Negative Checks

| Field | Value |
| --- | --- |
| Test Case ID | TC-API-01 |
| Priority | P1 |
| Type | API / Contract + Negative |
| Scenario | The published REST API returns a well-formed catalogue and rejects invalid login requests with the documented body-level status codes |
| Preconditions | Live site reachable; no authentication required |
| Automated in | `tests/api.spec.ts` — one test per step below |

| # | Request | Expected Result |
| --- | --- | --- |
| 1 | `GET /api/productsList` | HTTP 200; body `responseCode` = 200; `products` is non-empty; **every** record matches the `id` / `name` / `price` ("Rs. N") / `brand` / `category` schema |
| 2 | `POST /api/verifyLogin` with an unknown email/password | Body `responseCode` = 404 with "User not found!" — while the transport status is still HTTP 200, a site quirk asserted deliberately |
| 3 | `POST /api/verifyLogin` with the password omitted | Body `responseCode` = 400 with "Bad request, email or password parameter is missing in POST request." |

### Observation logged while automating TC-API-01

`GET /api/productsList` serves a JSON body with a `text/html` Content-Type
header (a HEAD request for the same URL says `application/json`). Documented as
a code comment in `tests/api.spec.ts`; in a real suite this would be filed as a
low-severity defect against the API.
