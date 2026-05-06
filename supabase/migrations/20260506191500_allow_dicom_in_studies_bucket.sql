UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/dicom'
]
WHERE id = 'pacients-studies-bucket';
