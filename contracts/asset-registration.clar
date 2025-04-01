;; Asset Registration Contract
;; Records details of available equipment

(define-data-var last-asset-id uint u0)

(define-map assets
  { asset-id: uint }
  {
    owner: principal,
    name: (string-ascii 64),
    description: (string-ascii 256),
    acquisition-date: uint,
    value: uint,
    status: (string-ascii 20),
    available: bool
  }
)

(define-read-only (get-asset (asset-id uint))
  (map-get? assets { asset-id: asset-id })
)

(define-read-only (get-last-asset-id)
  (var-get last-asset-id)
)

(define-public (register-asset
    (name (string-ascii 64))
    (description (string-ascii 256))
    (acquisition-date uint)
    (value uint))
  (let
    (
      (new-asset-id (+ (var-get last-asset-id) u1))
    )
    (var-set last-asset-id new-asset-id)
    (map-set assets
      { asset-id: new-asset-id }
      {
        owner: tx-sender,
        name: name,
        description: description,
        acquisition-date: acquisition-date,
        value: value,
        status: "active",
        available: true
      }
    )
    (ok new-asset-id)
  )
)

(define-public (update-asset-status
    (asset-id uint)
    (status (string-ascii 20))
    (available bool))
  (let
    (
      (asset (unwrap! (get-asset asset-id) (err u404)))
    )
    (asserts! (is-eq tx-sender (get owner asset)) (err u403))
    (map-set assets
      { asset-id: asset-id }
      (merge asset {
        status: status,
        available: available
      })
    )
    (ok true)
  )
)

(define-public (transfer-asset
    (asset-id uint)
    (new-owner principal))
  (let
    (
      (asset (unwrap! (get-asset asset-id) (err u404)))
    )
    (asserts! (is-eq tx-sender (get owner asset)) (err u403))
    (map-set assets
      { asset-id: asset-id }
      (merge asset { owner: new-owner })
    )
    (ok true)
  )
)

