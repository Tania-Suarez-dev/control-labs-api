-- Documentación del módulo Novedades.
-- La tabla ya está aplicada en la base de pruebas. NO ejecutar de nuevo.

CREATE TABLE IF NOT EXISTS incident_comments (
  id BIGSERIAL PRIMARY KEY,
  incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  tipo VARCHAR(16) NOT NULL DEFAULT 'COMENTARIO',
  contenido TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incident_comments_incident_created
ON incident_comments(incident_id, created_at DESC);
