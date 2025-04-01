;; Maintenance Tracking Contract
;; Monitors equipment condition and service

(define-data-var last-maintenance-id uint u0)

(define-map maintenance-records
  { maintenance-id: uint }
  {
    asset-id: uint,
    owner: principal,
    description: (string-ascii 256),
    date: uint,
    cost: uint,
    performed-by: principal,
    status: (string-ascii 20),
    next-maintenance-date: (optional uint)
  }
)

(define-read-only (get-maintenance-record (maintenance-id uint))
  (map-get? maintenance-records { maintenance-id: maintenance-id })
)

(define-read-only (get-last-maintenance-id)
  (var-get last-maintenance-id)
)

;; Simplified create-maintenance-record function without cross-contract calls
(define-public (create-maintenance-record
    (asset-id uint)
    (description (string-ascii 256))
    (cost uint)
    (next-maintenance-date (optional uint)))
  (let
    (
      (new-maintenance-id (+ (var-get last-maintenance-id) u1))
    )
    (var-set last-maintenance-id new-maintenance-id)
    (map-set maintenance-records
      { maintenance-id: new-maintenance-id }
      {
        asset-id: asset-id,
        owner: tx-sender,
        description: description,
        date: block-height,
        cost: cost,
        performed-by: tx-sender,
        status: "completed",
        next-maintenance-date: next-maintenance-date
      }
    )
    (ok new-maintenance-id)
  )
)

(define-public (schedule-maintenance
    (asset-id uint)
    (description (string-ascii 256))
    (scheduled-date uint))
  (let
    (
      (new-maintenance-id (+ (var-get last-maintenance-id) u1))
    )
    (var-set last-maintenance-id new-maintenance-id)
    (map-set maintenance-records
      { maintenance-id: new-maintenance-id }
      {
        asset-id: asset-id,
        owner: tx-sender,
        description: description,
        date: scheduled-date,
        cost: u0,
        performed-by: tx-sender,
        status: "scheduled",
        next-maintenance-date: none
      }
    )
    (ok new-maintenance-id)
  )
)

(define-public (complete-maintenance
    (maintenance-id uint)
    (cost uint)
    (next-maintenance-date (optional uint)))
  (let
    (
      (record (unwrap! (get-maintenance-record maintenance-id) (err u404)))
    )
    (asserts! (is-eq tx-sender (get owner record)) (err u403))
    (asserts! (is-eq (get status record) "scheduled") (err u400))

    (map-set maintenance-records
      { maintenance-id: maintenance-id }
      (merge record {
        date: block-height,
        cost: cost,
        status: "completed",
        next-maintenance-date: next-maintenance-date
      })
    )
    (ok true)
  )
)

(define-public (report-maintenance-issue
    (asset-id uint)
    (owner principal)
    (description (string-ascii 256)))
  (let
    (
      (new-maintenance-id (+ (var-get last-maintenance-id) u1))
    )
    (var-set last-maintenance-id new-maintenance-id)
    (map-set maintenance-records
      { maintenance-id: new-maintenance-id }
      {
        asset-id: asset-id,
        owner: owner,
        description: description,
        date: block-height,
        cost: u0,
        performed-by: tx-sender,
        status: "reported",
        next-maintenance-date: none
      }
    )
    (ok new-maintenance-id)
  )
)

