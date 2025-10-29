-- ============================================================================
-- Script: Añadir campo comunidad_autonoma y mapear provincias
-- Descripción: Añade columna region/CCAA y mapea automáticamente por provincia
-- Fecha: 2025-10-29
-- ============================================================================

-- 1. Añadir columna comunidad_autonoma a la tabla areas
ALTER TABLE areas 
ADD COLUMN IF NOT EXISTS comunidad_autonoma TEXT;

-- Crear índice para mejorar rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_areas_comunidad_autonoma ON areas(comunidad_autonoma);

-- ============================================================================
-- MAPEO ESPAÑA: Provincia → Comunidad Autónoma
-- ============================================================================

-- Andalucía
UPDATE areas SET comunidad_autonoma = 'Andalucía', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Almería', 'Cádiz', 'Córdoba', 'Granada', 'Huelva', 'Jaén', 'Málaga', 'Sevilla');

-- Aragón
UPDATE areas SET comunidad_autonoma = 'Aragón', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Huesca', 'Teruel', 'Zaragoza');

-- Asturias
UPDATE areas SET comunidad_autonoma = 'Asturias', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Asturias';

-- Islas Baleares
UPDATE areas SET comunidad_autonoma = 'Islas Baleares', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Baleares', 'Islas Baleares');

-- Canarias
UPDATE areas SET comunidad_autonoma = 'Canarias', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Las Palmas', 'Santa Cruz de Tenerife', 'Tenerife');

-- Cantabria
UPDATE areas SET comunidad_autonoma = 'Cantabria', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Cantabria';

-- Castilla y León
UPDATE areas SET comunidad_autonoma = 'Castilla y León', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Ávila', 'Burgos', 'León', 'Palencia', 'Salamanca', 'Segovia', 'Soria', 'Valladolid', 'Zamora');

-- Castilla-La Mancha
UPDATE areas SET comunidad_autonoma = 'Castilla-La Mancha', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Albacete', 'Ciudad Real', 'Cuenca', 'Guadalajara', 'Toledo');

-- Cataluña
UPDATE areas SET comunidad_autonoma = 'Cataluña', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Barcelona', 'Girona', 'Lérida', 'Tarragona', 'Lleida');

-- Comunidad Valenciana
UPDATE areas SET comunidad_autonoma = 'Comunidad Valenciana', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Alicante', 'Castellón', 'Valencia');

-- Extremadura
UPDATE areas SET comunidad_autonoma = 'Extremadura', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Badajoz', 'Cáceres');

-- Galicia
UPDATE areas SET comunidad_autonoma = 'Galicia', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('La Coruña', 'Lugo', 'Ourense', 'Pontevedra', 'A Coruña', 'Orense');

-- Comunidad de Madrid
UPDATE areas SET comunidad_autonoma = 'Comunidad de Madrid', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Madrid';

-- Región de Murcia
UPDATE areas SET comunidad_autonoma = 'Región de Murcia', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Murcia';

-- Comunidad Foral de Navarra
UPDATE areas SET comunidad_autonoma = 'Navarra', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'Navarra';

-- País Vasco
UPDATE areas SET comunidad_autonoma = 'País Vasco', updated_at = NOW()
WHERE pais = 'España' AND provincia IN ('Álava', 'Guipúzcoa', 'Vizcaya', 'Araba', 'Gipuzkoa', 'Bizkaia');

-- La Rioja
UPDATE areas SET comunidad_autonoma = 'La Rioja', updated_at = NOW()
WHERE pais = 'España' AND provincia = 'La Rioja';

-- ============================================================================
-- MAPEO FRANCIA: Departamento → Región
-- ============================================================================

-- Auvergne-Rhône-Alpes
UPDATE areas SET comunidad_autonoma = 'Auvergne-Rhône-Alpes', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Ain%' OR provincia LIKE '%Allier%' OR provincia LIKE '%Ardèche%' OR 
  provincia LIKE '%Cantal%' OR provincia LIKE '%Drôme%' OR provincia LIKE '%Isère%' OR 
  provincia LIKE '%Loire%' OR provincia LIKE '%Haute-Loire%' OR provincia LIKE '%Puy-de-Dôme%' OR 
  provincia LIKE '%Rhône%' OR provincia LIKE '%Savoie%' OR provincia LIKE '%Haute-Savoie%'
);

-- Bourgogne-Franche-Comté
UPDATE areas SET comunidad_autonoma = 'Bourgogne-Franche-Comté', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Côte-d''Or%' OR provincia LIKE '%Doubs%' OR provincia LIKE '%Jura%' OR 
  provincia LIKE '%Nièvre%' OR provincia LIKE '%Haute-Saône%' OR provincia LIKE '%Saône-et-Loire%' OR 
  provincia LIKE '%Yonne%' OR provincia LIKE '%Territoire de Belfort%'
);

-- Bretagne (Bretaña)
UPDATE areas SET comunidad_autonoma = 'Bretagne', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Côtes-d''Armor%' OR provincia LIKE '%Finistère%' OR 
  provincia LIKE '%Ille-et-Vilaine%' OR provincia LIKE '%Morbihan%' OR
  provincia LIKE '%Bretagne%' OR provincia LIKE '%Bretaña%'
);

-- Centre-Val de Loire
UPDATE areas SET comunidad_autonoma = 'Centre-Val de Loire', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Cher%' OR provincia LIKE '%Eure-et-Loir%' OR provincia LIKE '%Indre%' OR 
  provincia LIKE '%Indre-et-Loire%' OR provincia LIKE '%Loir-et-Cher%' OR provincia LIKE '%Loiret%'
);

-- Corse (Córcega)
UPDATE areas SET comunidad_autonoma = 'Corse', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Corse%' OR provincia LIKE '%Córcega%' OR 
  provincia LIKE '%Haute-Corse%' OR provincia LIKE '%Corse-du-Sud%'
);

-- Grand Est
UPDATE areas SET comunidad_autonoma = 'Grand Est', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Ardennes%' OR provincia LIKE '%Aube%' OR provincia LIKE '%Marne%' OR 
  provincia LIKE '%Haute-Marne%' OR provincia LIKE '%Meurthe-et-Moselle%' OR provincia LIKE '%Meuse%' OR 
  provincia LIKE '%Moselle%' OR provincia LIKE '%Bas-Rhin%' OR provincia LIKE '%Haut-Rhin%' OR 
  provincia LIKE '%Vosges%' OR provincia LIKE '%Alsace%' OR provincia LIKE '%Lorraine%'
);

-- Hauts-de-France
UPDATE areas SET comunidad_autonoma = 'Hauts-de-France', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Aisne%' OR provincia LIKE '%Nord%' OR provincia LIKE '%Oise%' OR 
  provincia LIKE '%Pas-de-Calais%' OR provincia LIKE '%Somme%'
);

-- Île-de-France (París y alrededores)
UPDATE areas SET comunidad_autonoma = 'Île-de-France', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Paris%' OR provincia LIKE '%París%' OR provincia LIKE '%Seine%' OR 
  provincia LIKE '%Essonne%' OR provincia LIKE '%Hauts-de-Seine%' OR provincia LIKE '%Seine-Saint-Denis%' OR 
  provincia LIKE '%Val-de-Marne%' OR provincia LIKE '%Val-d''Oise%' OR provincia LIKE '%Yvelines%'
);

-- Normandie (Normandía)
UPDATE areas SET comunidad_autonoma = 'Normandie', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Calvados%' OR provincia LIKE '%Eure%' OR provincia LIKE '%Manche%' OR 
  provincia LIKE '%Orne%' OR provincia LIKE '%Seine-Maritime%' OR provincia LIKE '%Normandie%' OR
  provincia LIKE '%Normandía%'
);

-- Nouvelle-Aquitaine
UPDATE areas SET comunidad_autonoma = 'Nouvelle-Aquitaine', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Charente%' OR provincia LIKE '%Corrèze%' OR provincia LIKE '%Creuse%' OR 
  provincia LIKE '%Dordogne%' OR provincia LIKE '%Gironde%' OR provincia LIKE '%Landes%' OR 
  provincia LIKE '%Lot-et-Garonne%' OR provincia LIKE '%Pyrénées-Atlantiques%' OR 
  provincia LIKE '%Deux-Sèvres%' OR provincia LIKE '%Vienne%' OR provincia LIKE '%Haute-Vienne%' OR
  provincia LIKE '%Aquitaine%' OR provincia LIKE '%Aquitania%'
);

-- Occitanie
UPDATE areas SET comunidad_autonoma = 'Occitanie', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Ariège%' OR provincia LIKE '%Aude%' OR provincia LIKE '%Aveyron%' OR 
  provincia LIKE '%Gard%' OR provincia LIKE '%Haute-Garonne%' OR provincia LIKE '%Gers%' OR 
  provincia LIKE '%Hérault%' OR provincia LIKE '%Lot%' OR provincia LIKE '%Lozère%' OR 
  provincia LIKE '%Hautes-Pyrénées%' OR provincia LIKE '%Pyrénées-Orientales%' OR 
  provincia LIKE '%Tarn%' OR provincia LIKE '%Tarn-et-Garonne%' OR
  provincia LIKE '%Languedoc%' OR provincia LIKE '%Midi-Pyrénées%'
);

-- Pays de la Loire
UPDATE areas SET comunidad_autonoma = 'Pays de la Loire', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Loire-Atlantique%' OR provincia LIKE '%Maine-et-Loire%' OR 
  provincia LIKE '%Mayenne%' OR provincia LIKE '%Sarthe%' OR provincia LIKE '%Vendée%'
);

-- Provence-Alpes-Côte d'Azur (PACA)
UPDATE areas SET comunidad_autonoma = 'Provence-Alpes-Côte d''Azur', updated_at = NOW()
WHERE pais = 'Francia' AND (
  provincia LIKE '%Alpes-de-Haute-Provence%' OR provincia LIKE '%Hautes-Alpes%' OR 
  provincia LIKE '%Alpes-Maritimes%' OR provincia LIKE '%Bouches-du-Rhône%' OR 
  provincia LIKE '%Var%' OR provincia LIKE '%Vaucluse%' OR
  provincia LIKE '%Provence%' OR provincia LIKE '%Côte d''Azur%' OR provincia LIKE '%PACA%'
);

-- ============================================================================
-- MAPEO PORTUGAL: Distrito → Região
-- ============================================================================

-- Norte
UPDATE areas SET comunidad_autonoma = 'Norte', updated_at = NOW()
WHERE pais = 'Portugal' AND (
  provincia LIKE '%Braga%' OR provincia LIKE '%Bragança%' OR provincia LIKE '%Porto%' OR 
  provincia LIKE '%Viana do Castelo%' OR provincia LIKE '%Vila Real%'
);

-- Centro
UPDATE areas SET comunidad_autonoma = 'Centro', updated_at = NOW()
WHERE pais = 'Portugal' AND (
  provincia LIKE '%Aveiro%' OR provincia LIKE '%Castelo Branco%' OR provincia LIKE '%Coimbra%' OR 
  provincia LIKE '%Guarda%' OR provincia LIKE '%Leiria%' OR provincia LIKE '%Viseu%'
);

-- Lisboa
UPDATE areas SET comunidad_autonoma = 'Lisboa', updated_at = NOW()
WHERE pais = 'Portugal' AND (
  provincia LIKE '%Lisboa%' OR provincia LIKE '%Setúbal%'
);

-- Alentejo
UPDATE areas SET comunidad_autonoma = 'Alentejo', updated_at = NOW()
WHERE pais = 'Portugal' AND (
  provincia LIKE '%Beja%' OR provincia LIKE '%Évora%' OR provincia LIKE '%Portalegre%'
);

-- Algarve
UPDATE areas SET comunidad_autonoma = 'Algarve', updated_at = NOW()
WHERE pais = 'Portugal' AND provincia LIKE '%Faro%';

-- Açores (Azores)
UPDATE areas SET comunidad_autonoma = 'Açores', updated_at = NOW()
WHERE pais = 'Portugal' AND (provincia LIKE '%Açores%' OR provincia LIKE '%Azores%');

-- Madeira
UPDATE areas SET comunidad_autonoma = 'Madeira', updated_at = NOW()
WHERE pais = 'Portugal' AND provincia LIKE '%Madeira%';

-- ============================================================================
-- MAPEO ITALIA: Provincia → Regione
-- ============================================================================

-- Toscana
UPDATE areas SET comunidad_autonoma = 'Toscana', updated_at = NOW()
WHERE pais = 'Italia' AND (
  provincia LIKE '%Firenze%' OR provincia LIKE '%Florencia%' OR provincia LIKE '%Pisa%' OR 
  provincia LIKE '%Siena%' OR provincia LIKE '%Livorno%' OR provincia LIKE '%Lucca%' OR 
  provincia LIKE '%Arezzo%' OR provincia LIKE '%Grosseto%' OR provincia LIKE '%Pistoia%' OR 
  provincia LIKE '%Prato%' OR provincia LIKE '%Toscana%'
);

-- Lazio (Roma)
UPDATE areas SET comunidad_autonoma = 'Lazio', updated_at = NOW()
WHERE pais = 'Italia' AND (
  provincia LIKE '%Roma%' OR provincia LIKE '%Frosinone%' OR provincia LIKE '%Latina%' OR 
  provincia LIKE '%Rieti%' OR provincia LIKE '%Viterbo%' OR provincia LIKE '%Lazio%'
);

-- Lombardía
UPDATE areas SET comunidad_autonoma = 'Lombardia', updated_at = NOW()
WHERE pais = 'Italia' AND (
  provincia LIKE '%Milano%' OR provincia LIKE '%Milán%' OR provincia LIKE '%Bergamo%' OR 
  provincia LIKE '%Brescia%' OR provincia LIKE '%Como%' OR provincia LIKE '%Cremona%' OR 
  provincia LIKE '%Lecco%' OR provincia LIKE '%Lodi%' OR provincia LIKE '%Mantova%' OR 
  provincia LIKE '%Monza%' OR provincia LIKE '%Pavia%' OR provincia LIKE '%Sondrio%' OR 
  provincia LIKE '%Varese%' OR provincia LIKE '%Lombardia%' OR provincia LIKE '%Lombardía%'
);

-- Véneto
UPDATE areas SET comunidad_autonoma = 'Veneto', updated_at = NOW()
WHERE pais = 'Italia' AND (
  provincia LIKE '%Venezia%' OR provincia LIKE '%Venecia%' OR provincia LIKE '%Verona%' OR 
  provincia LIKE '%Padova%' OR provincia LIKE '%Padua%' OR provincia LIKE '%Treviso%' OR 
  provincia LIKE '%Vicenza%' OR provincia LIKE '%Rovigo%' OR provincia LIKE '%Belluno%' OR 
  provincia LIKE '%Veneto%' OR provincia LIKE '%Véneto%'
);

-- Piamonte
UPDATE areas SET comunidad_autonoma = 'Piemonte', updated_at = NOW()
WHERE pais = 'Italia' AND (
  provincia LIKE '%Torino%' OR provincia LIKE '%Turín%' OR provincia LIKE '%Alessandria%' OR 
  provincia LIKE '%Asti%' OR provincia LIKE '%Biella%' OR provincia LIKE '%Cuneo%' OR 
  provincia LIKE '%Novara%' OR provincia LIKE '%Verbano%' OR provincia LIKE '%Vercelli%' OR
  provincia LIKE '%Piemonte%' OR provincia LIKE '%Piamonte%'
);

-- Emilia-Romaña
UPDATE areas SET comunidad_autonoma = 'Emilia-Romagna', updated_at = NOW()
WHERE pais = 'Italia' AND (
  provincia LIKE '%Bologna%' OR provincia LIKE '%Bolonia%' OR provincia LIKE '%Ferrara%' OR 
  provincia LIKE '%Forlì%' OR provincia LIKE '%Modena%' OR provincia LIKE '%Parma%' OR 
  provincia LIKE '%Piacenza%' OR provincia LIKE '%Ravenna%' OR provincia LIKE '%Reggio Emilia%' OR 
  provincia LIKE '%Rimini%' OR provincia LIKE '%Emilia%'
);

-- Liguria
UPDATE areas SET comunidad_autonoma = 'Liguria', updated_at = NOW()
WHERE pais = 'Italia' AND (
  provincia LIKE '%Genova%' OR provincia LIKE '%Génova%' OR provincia LIKE '%Imperia%' OR 
  provincia LIKE '%La Spezia%' OR provincia LIKE '%Savona%' OR provincia LIKE '%Liguria%'
);

-- Campania (Nápoles)
UPDATE areas SET comunidad_autonoma = 'Campania', updated_at = NOW()
WHERE pais = 'Italia' AND (
  provincia LIKE '%Napoli%' OR provincia LIKE '%Nápoles%' OR provincia LIKE '%Avellino%' OR 
  provincia LIKE '%Benevento%' OR provincia LIKE '%Caserta%' OR provincia LIKE '%Salerno%' OR
  provincia LIKE '%Campania%'
);

-- Sicilia
UPDATE areas SET comunidad_autonoma = 'Sicilia', updated_at = NOW()
WHERE pais = 'Italia' AND (
  provincia LIKE '%Palermo%' OR provincia LIKE '%Catania%' OR provincia LIKE '%Messina%' OR 
  provincia LIKE '%Siracusa%' OR provincia LIKE '%Trapani%' OR provincia LIKE '%Agrigento%' OR 
  provincia LIKE '%Caltanissetta%' OR provincia LIKE '%Enna%' OR provincia LIKE '%Ragusa%' OR
  provincia LIKE '%Sicilia%'
);

-- Cerdeña
UPDATE areas SET comunidad_autonoma = 'Sardegna', updated_at = NOW()
WHERE pais = 'Italia' AND (
  provincia LIKE '%Cagliari%' OR provincia LIKE '%Sassari%' OR provincia LIKE '%Nuoro%' OR 
  provincia LIKE '%Oristano%' OR provincia LIKE '%Sardegna%' OR provincia LIKE '%Cerdeña%'
);

-- ============================================================================
-- MAPEO ALEMANIA: Estado (Bundesland)
-- ============================================================================

-- Bayern (Baviera)
UPDATE areas SET comunidad_autonoma = 'Bayern', updated_at = NOW()
WHERE pais = 'Alemania' AND (
  provincia LIKE '%Bayern%' OR provincia LIKE '%Bavaria%' OR provincia LIKE '%Baviera%' OR
  provincia LIKE '%München%' OR provincia LIKE '%Munich%' OR provincia LIKE '%Nürnberg%'
);

-- Baden-Württemberg
UPDATE areas SET comunidad_autonoma = 'Baden-Württemberg', updated_at = NOW()
WHERE pais = 'Alemania' AND (
  provincia LIKE '%Baden%' OR provincia LIKE '%Württemberg%' OR 
  provincia LIKE '%Stuttgart%' OR provincia LIKE '%Freiburg%'
);

-- Nordrhein-Westfalen (Renania del Norte-Westfalia)
UPDATE areas SET comunidad_autonoma = 'Nordrhein-Westfalen', updated_at = NOW()
WHERE pais = 'Alemania' AND (
  provincia LIKE '%Nordrhein%' OR provincia LIKE '%Westfalen%' OR 
  provincia LIKE '%Köln%' OR provincia LIKE '%Colonia%' OR provincia LIKE '%Düsseldorf%'
);

-- Niedersachsen (Baja Sajonia)
UPDATE areas SET comunidad_autonoma = 'Niedersachsen', updated_at = NOW()
WHERE pais = 'Alemania' AND (
  provincia LIKE '%Niedersachsen%' OR provincia LIKE '%Hannover%' OR provincia LIKE '%Braunschweig%'
);

-- Hessen
UPDATE areas SET comunidad_autonoma = 'Hessen', updated_at = NOW()
WHERE pais = 'Alemania' AND (
  provincia LIKE '%Hessen%' OR provincia LIKE '%Frankfurt%' OR provincia LIKE '%Wiesbaden%'
);

-- ============================================================================
-- MAPEO PAÍSES BAJOS: Provincia
-- ============================================================================

UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Países Bajos' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- ============================================================================
-- MAPEO BÉLGICA: Región
-- ============================================================================

-- Flandes
UPDATE areas SET comunidad_autonoma = 'Flandes', updated_at = NOW()
WHERE pais = 'Bélgica' AND (
  provincia LIKE '%Vlaanderen%' OR provincia LIKE '%Flandes%' OR 
  provincia LIKE '%Antwerpen%' OR provincia LIKE '%Brussel%' OR provincia LIKE '%Gent%' OR
  provincia LIKE '%Limburg%' OR provincia LIKE '%Oost-Vlaanderen%' OR provincia LIKE '%West-Vlaanderen%'
);

-- Valonia
UPDATE areas SET comunidad_autonoma = 'Valonia', updated_at = NOW()
WHERE pais = 'Bélgica' AND (
  provincia LIKE '%Wallonie%' OR provincia LIKE '%Valonia%' OR 
  provincia LIKE '%Hainaut%' OR provincia LIKE '%Liège%' OR provincia LIKE '%Namur%' OR
  provincia LIKE '%Luxembourg%' OR provincia LIKE '%Brabant Wallon%'
);

-- Bruselas
UPDATE areas SET comunidad_autonoma = 'Bruselas-Capital', updated_at = NOW()
WHERE pais = 'Bélgica' AND (
  provincia LIKE '%Bruxelles%' OR provincia LIKE '%Bruselas%' OR provincia LIKE '%Brussels%'
);

-- ============================================================================
-- MAPEO SUIZA: Cantón
-- ============================================================================

UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Suiza' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- ============================================================================
-- MAPEO AUSTRIA: Estado (Bundesland)
-- ============================================================================

UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Austria' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- ============================================================================
-- MAPEO REINO UNIDO: País/Región
-- ============================================================================

-- Inglaterra
UPDATE areas SET comunidad_autonoma = 'England', updated_at = NOW()
WHERE pais = 'Reino Unido' AND (
  provincia LIKE '%England%' OR provincia LIKE '%Inglaterra%' OR 
  provincia LIKE '%London%' OR provincia LIKE '%Londres%'
);

-- Escocia
UPDATE areas SET comunidad_autonoma = 'Scotland', updated_at = NOW()
WHERE pais = 'Reino Unido' AND (
  provincia LIKE '%Scotland%' OR provincia LIKE '%Escocia%' OR provincia LIKE '%Edinburgh%'
);

-- Gales
UPDATE areas SET comunidad_autonoma = 'Wales', updated_at = NOW()
WHERE pais = 'Reino Unido' AND (
  provincia LIKE '%Wales%' OR provincia LIKE '%Gales%' OR provincia LIKE '%Cardiff%'
);

-- Irlanda del Norte
UPDATE areas SET comunidad_autonoma = 'Northern Ireland', updated_at = NOW()
WHERE pais = 'Reino Unido' AND (
  provincia LIKE '%Northern Ireland%' OR provincia LIKE '%Irlanda del Norte%' OR provincia LIKE '%Belfast%'
);

-- ============================================================================
-- MAPEO OTROS PAÍSES EUROPEOS
-- ============================================================================

-- Polonia - usar Voivodato (provincia = región)
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Polonia' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- República Checa - usar Región
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'República Checa' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- Croacia - usar Županija (condado)
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Croacia' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- Noruega - usar Fylke (condado)
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Noruega' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- Suecia - usar Län (condado)
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Suecia' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- Dinamarca - usar Región
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Dinamarca' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- Grecia - usar Periphereia (región)
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Grecia' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- Eslovenia - usar Región estadística
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Eslovenia' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- ============================================================================
-- MAPEO PAÍSES AMERICANOS
-- ============================================================================

-- Estados Unidos - Estados
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Estados Unidos' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- Argentina - Provincias
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Argentina' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- Chile - Regiones
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Chile' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- ============================================================================
-- MAPEO RESTO DEL MUNDO
-- ============================================================================

-- Australia - Estados/Territorios
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Australia' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- Nueva Zelanda - Regiones
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Nueva Zelanda' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- Marruecos - Regiones
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE pais = 'Marruecos' AND provincia IS NOT NULL AND comunidad_autonoma IS NULL;

-- Para países sin mapeo específico, usar provincia como región
UPDATE areas SET comunidad_autonoma = provincia, updated_at = NOW()
WHERE activo = true 
  AND pais IS NOT NULL 
  AND provincia IS NOT NULL 
  AND comunidad_autonoma IS NULL;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver resumen por país y CCAA
SELECT 
  pais,
  comunidad_autonoma,
  COUNT(*) as total_areas
FROM areas
WHERE activo = true AND pais IS NOT NULL
GROUP BY pais, comunidad_autonoma
ORDER BY pais, total_areas DESC;

-- Ver áreas sin CCAA asignada (para revisar)
SELECT 
  pais,
  provincia,
  COUNT(*) as areas_sin_ccaa
FROM areas
WHERE activo = true 
  AND pais IS NOT NULL 
  AND comunidad_autonoma IS NULL
GROUP BY pais, provincia
ORDER BY pais, areas_sin_ccaa DESC
LIMIT 50;

-- Resumen final
SELECT 
  pais,
  COUNT(DISTINCT comunidad_autonoma) as regiones,
  COUNT(DISTINCT provincia) as provincias,
  COUNT(*) as total_areas
FROM areas
WHERE activo = true AND pais IS NOT NULL
GROUP BY pais
ORDER BY total_areas DESC;

