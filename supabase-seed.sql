-- Seed data for projects table
INSERT INTO projects (id, name, description, lat, lng, customer, project_type, address) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Syracuse Solar Array', '10kW solar installation for a local business.', 43.0481, -76.1474, 'Syracuse Business', 'Commercial', '123 Main St, Syracuse, NY'),
('550e8400-e29b-41d4-a716-446655440002', 'Utica Rooftop Solar', 'Residential solar panel setup.', 43.1009, -75.2327, 'Utica Homeowner', 'Residential', '456 Oak Ave, Utica, NY'),
('550e8400-e29b-41d4-a716-446655440003', 'Rome Community Center', 'Community center solar project.', 43.2128, -75.4557, 'Rome Community', 'Community', '789 Community Dr, Rome, NY'),
('550e8400-e29b-41d4-a716-446655440004', 'Auburn School Solar', 'School solar energy upgrade.', 42.9317, -76.5661, 'Auburn School District', 'Educational', '321 School St, Auburn, NY'),
('550e8400-e29b-41d4-a716-446655440005', 'Cortland Farm Array', 'Solar for agricultural use.', 42.6012, -76.1805, 'Cortland Farm', 'Agricultural', '654 Farm Rd, Cortland, NY');

-- Seed data for reviews table
INSERT INTO reviews (project_id, author, rating, text) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John D.', 5, 'Great work and fast!'),
('550e8400-e29b-41d4-a716-446655440001', 'Lisa M.', 4, 'Very professional team.'),
('550e8400-e29b-41d4-a716-446655440002', 'Mike S.', 5, 'Saved a lot on my bills!'),
('550e8400-e29b-41d4-a716-446655440003', 'Sarah T.', 5, 'Excellent installation.'),
('550e8400-e29b-41d4-a716-446655440004', 'Principal K.', 4, 'Students love learning about solar!'),
('550e8400-e29b-41d4-a716-446655440005', 'Farmer Joe', 5, 'Reliable and efficient.');