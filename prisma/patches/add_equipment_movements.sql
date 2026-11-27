-- Documentación del módulo Equipos.
-- La tabla ya está aplicada en la base de pruebas. NO ejecutar de nuevo.

CREATE TABLE IF NOT EXISTS equipment_movements (
  id BIGSERIAL PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
  from_room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  to_room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  moved_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_movements_equipment_created
ON equipment_movements(equipment_id, created_at DESC);
