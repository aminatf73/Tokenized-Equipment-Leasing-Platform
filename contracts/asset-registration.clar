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
  (var-get last-asset-
