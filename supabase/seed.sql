-- Seed patients data
INSERT INTO patients (first_name, last_name, date_of_birth, street, street_number, locality, postal_code, gender, condition_coverage, phone, is_active, created_at) VALUES
('María', 'González', '1990-05-15', 'Av. Corrientes', '1245', 'Ciudad Autónoma de Buenos Aires', '1043', 'female', 'health_insurance', '11-4567-8901', true, NOW() - INTERVAL '1 hour'),
('Carlos', 'Rodríguez', '1978-08-22', 'Calle Florida', '890', 'Ciudad Autónoma de Buenos Aires', '1003', 'male', 'private', '11-2345-6789', true, NOW() - INTERVAL '2 hours'),
('Sofía', 'Martínez', '2015-03-10', 'Av. Santa Fe', '456', 'Ciudad Autónoma de Buenos Aires', '1425', 'female', 'health_insurance', '11-9876-5432', true, NOW() - INTERVAL '3 hours'),
('Jorge', 'López', '1965-11-30', 'Calle Lavalle', '1500', 'Ciudad Autónoma de Buenos Aires', '1048', 'male', 'private', '11-3456-7890', true, NOW() - INTERVAL '4 hours'),
('Ana', 'Pérez', '1988-07-25', 'Av. Rivadavia', '8500', 'Ciudad Autónoma de Buenos Aires', '1405', 'female', 'health_insurance', '11-5678-9012', true, NOW() - INTERVAL '5 hours'),
('Miguel', 'Sánchez', '1972-02-14', 'Calle Sarmiento', '2100', 'Ciudad Autónoma de Buenos Aires', '1044', 'male', 'private', '11-6789-0123', true, NOW() - INTERVAL '6 hours'),
('Laura', 'Fernández', '1995-12-08', 'Av. Belgrano', '750', 'Ciudad Autónoma de Buenos Aires', '1093', 'female', 'health_insurance', '11-7890-1234', true, NOW() - INTERVAL '7 hours'),
('Roberto', 'Gómez', '1958-06-20', 'Calle Mitre', '500', 'Ciudad Autónoma de Buenos Aires', '1037', 'male', 'private', '11-8901-2345', true, NOW() - INTERVAL '8 hours'),
('Claudia', 'Díaz', '1982-09-18', 'Av. Callao', '450', 'Ciudad Autónoma de Buenos Aires', '1024', 'female', 'health_insurance', '11-9012-3456', true, NOW() - INTERVAL '9 hours'),
('Javier', 'Torres', '2008-01-05', 'Calle Pasteur', '120', 'Ciudad Autónoma de Buenos Aires', '1128', 'male', 'health_insurance', '11-0123-4567', true, NOW() - INTERVAL '10 hours'),
('Mariana', 'Ramírez', '1992-04-12', 'Av. Directorio', '3200', 'Ciudad Autónoma de Buenos Aires', '1430', 'female', 'private', '11-1234-5678', true, NOW() - INTERVAL '11 hours'),
('Fernando', 'Morales', '1970-10-28', 'Calle Ayacucho', '950', 'Ciudad Autónoma de Buenos Aires', '1126', 'male', 'private', '11-2345-6789', true, NOW() - INTERVAL '12 hours'),
('Silvia', 'Herrera', '1985-08-03', 'Av. Juan B. Justo', '1800', 'Ciudad Autónoma de Buenos Aires', '1414', 'female', 'health_insurance', '11-3456-7890', true, NOW() - INTERVAL '13 hours'),
('Diego', 'Aguirre', '1962-12-19', 'Calle Uruguay', '300', 'Ciudad Autónoma de Buenos Aires', '1017', 'male', 'private', '11-4567-8901', true, NOW() - INTERVAL '14 hours'),
('Natalia', 'Medina', '2000-02-27', 'Av. Monroe', '2500', 'Ciudad Autónoma de Buenos Aires', '1428', 'female', 'health_insurance', '11-5678-9012', true, NOW() - INTERVAL '15 hours'),
('Gustavo', 'Ortiz', '1975-06-11', 'Calle Chile', '800', 'Ciudad Autónoma de Buenos Aires', '1049', 'male', 'private', '11-6789-0123', true, NOW() - INTERVAL '16 hours'),
('Andrea', 'Cruz', '1998-11-22', 'Av. Del Libertador', '1500', 'Ciudad Autónoma de Buenos Aires', '1001', 'female', 'health_insurance', '11-7890-1234', true, NOW() - INTERVAL '17 hours'),
('Martín', 'Vega', '1980-03-07', 'Calle México', '1200', 'Ciudad Autónoma de Buenos Aires', '1097', 'male', 'private', '11-8901-2345', true, NOW() - INTERVAL '18 hours'),
('Carolina', 'Reyes', '2010-09-14', 'Av. San Martín', '4200', 'Ciudad Autónoma de Buenos Aires', '1436', 'female', 'health_insurance', '11-9012-3456', true, NOW() - INTERVAL '19 hours'),
('Luis', 'Núñez', '1955-01-30', 'Calle Perú', '600', 'Ciudad Autónoma de Buenos Aires', '1014', 'male', 'private', '11-0123-4567', true, NOW() - INTERVAL '20 hours')
ON CONFLICT DO NOTHING;