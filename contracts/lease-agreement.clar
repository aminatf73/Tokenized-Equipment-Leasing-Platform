;; Lease Agreement Contract
;; Manages terms between owners and lessees

(define-data-var last-lease-id uint u0)

(define-map leases
  { lease-id: uint }
  {
    asset-id: uint,
    owner: principal,
    lessee: principal,
    start-date: uint,
    end-date: uint,
    payment-amount: uint,
    payment-frequency: uint,
    status: (string-ascii 20),
    security-deposit: uint
  }
)

(define-read-only (get-lease (lease-id uint))
  (map-get? leases { lease-id: lease-id })
)

(define-read-only (get-last-lease-id)
  (var-get last-lease-id)
)

;; Simplified create-lease function without cross-contract calls
(define-public (create-lease
    (asset-id uint)
    (lessee principal)
    (start-date uint)
    (end-date uint)
    (payment-amount uint)
    (payment-frequency uint)
    (security-deposit uint))
  (let
    (
      (new-lease-id (+ (var-get last-lease-id) u1))
    )
    ;; Create lease
    (var-set last-lease-id new-lease-id)
    (map-set leases
      { lease-id: new-lease-id }
      {
        asset-id: asset-id,
        owner: tx-sender,
        lessee: lessee,
        start-date: start-date,
        end-date: end-date,
        payment-amount: payment-amount,
        payment-frequency: payment-frequency,
        status: "active",
        security-deposit: security-deposit
      }
    )
    (ok new-lease-id)
  )
)

(define-public (terminate-lease
    (lease-id uint))
  (let
    (
      (lease (unwrap! (get-lease lease-id) (err u404)))
    )
    (asserts! (or (is-eq tx-sender (get owner lease)) (is-eq tx-sender (get lessee lease))) (err u403))

    ;; Update lease status
    (map-set leases
      { lease-id: lease-id }
      (merge lease { status: "terminated" })
    )

    (ok true)
  )
)

(define-public (extend-lease
    (lease-id uint)
    (new-end-date uint))
  (let
    (
      (lease (unwrap! (get-lease lease-id) (err u404)))
    )
    (asserts! (is-eq tx-sender (get owner lease)) (err u403))
    (asserts! (is-eq (get status lease) "active") (err u400))
    (asserts! (> new-end-date (get end-date lease)) (err u400))

    (map-set leases
      { lease-id: lease-id }
      (merge lease { end-date: new-end-date })
    )
    (ok true)
  )
)

