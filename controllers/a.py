import ee
import geemap

# Authenticate
ee.Initialize()

# Define your farm location
farm = ee.Geometry.Rectangle([38.72, 8.8, 38.76, 8.84])

# Load Sentinel-2 and calculate NDVI
s2 = ee.ImageCollection("COPERNICUS/S2_SR") \
    .filterBounds(farm) \
    .filterDate("2024-08-01", "2024-08-31") \
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10)) \
    .median()

ndvi = s2.normalizedDifference(['B8', 'B4']).rename('NDVI')

# Export to Google Drive (optional)
task = ee.batch.Export.image.toDrive(
    image=ndvi.clip(farm),
    description='NDVI_Aug2024',
    scale=10,
    region=farm.getInfo()['coordinates'],
    fileFormat='GeoTIFF'
)
task.start()
