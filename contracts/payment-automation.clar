;; Payment Automation Contract
;; Handles recurring lease transactions

(define-data-var last-payment-id uint u0)

(define-map payments
  { payment-id: uint }
  {
    lease-id: uint,
    owner: principal,
    lessee: principal,
    amount: uint,
    due-date: uint,
    paid-date: (optional uint),
    status: (string-ascii 20)
  }
)

(define-read-only (get-payment (payment-id uint))
  (map-get? payments { payment-id: payment-id })
)

(define-read-only (get-last-payment-id)
  (var-get last-payment-id)
)

;; Simplified create-payment function without cross-contract calls
(define-public (create-payment
    (lease-id uint)
    (lessee principal)
    (amount uint)
    (due-date uint))
  (let
    (
      (new-payment-id (+ (var-get last-payment-id) u1))
    )
    (var-set last-payment-id new-payment-id)
    (map-set payments
      { payment-id: new-payment-id }
      {
        lease-id: lease-id,
        owner: tx-sender,
        lessee: lessee,
        amount: amount,
        due-date: due-date,
        paid-date: none,
        status: "pending"
      }
    )
    (ok new-payment-id)
  )
)

(define-public (make-payment (payment-id uint))
  (let
    (
      (payment (unwrap! (get-payment payment-id) (err u404)))
    )
    (asserts! (is-eq tx-sender (get lessee payment)) (err u403))
    (asserts! (is-eq (get status payment) "pending") (err u400))

    ;; Update payment status
    (map-set payments
      { payment-id: payment-id }
      (merge payment {
        paid-date: (some block-height),
        status: "paid"
      })
    )

    ;; Transfer tokens from lessee to owner
    (unwrap! (stx-transfer? (get amount payment) tx-sender (get owner payment)) (err u500))

    (ok true)
  )
)

(define-public (mark-payment-late (payment-id uint))
  (let
    (
      (payment (unwrap! (get-payment payment-id) (err u404)))
    )
    (asserts! (is-eq tx-sender (get owner payment)) (err u403))
    (asserts! (is-eq (get status payment) "pending") (err u400))
    (asserts! (> block-height (get due-date payment)) (err u400))

    (map-set payments
      { payment-id: payment-id }
      (merge payment { status: "late" })
    )
    (ok true)
  )
)

