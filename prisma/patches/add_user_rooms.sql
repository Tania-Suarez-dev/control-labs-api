-- Documentación del módulo Ambientes.
-- La tabla ya está aplicada en la base de pruebas. NO ejecutar de nuevo.

CREATE TABLE IF NOT EXISTS user_rooms (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, room_id)
);

CREATE INDEX IF NOT EXISTS idx_user_rooms_room
ON user_rooms(room_id);
