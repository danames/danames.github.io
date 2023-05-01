Sure, I can help you write a design document for your new REST API. Here is a template that you can fill in with the appropriate information for each task:

# API Design Document

## Overview

This document describes the design of a REST API for retrieving historical forecasts from the U.S. National Water Model. The forecasts are stored in a Google Big Query Table, and the API will be implemented using Google Cloud Functions and API Gateway. The API will provide various tasks to retrieve data from the Big Query table, and the design of each task will be organized by "Task".

## Task 1: Retrieve Forecast Data by Date Range

### Existing REST API:

Similar to the GEOGLOWS ECMWF Streamflow Service, the following REST API can be used as an example for retrieving forecast data by date range:

```
GET /api/forecast?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

### Proposed REST API:

The proposed REST API for retrieving forecast data by date range is:

```
GET /api/forecast?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

### URI Query-String Pattern:

- `start_date`: The start date of the date range to retrieve the forecast data. Format: YYYY-MM-DD. Required parameter.
- `end_date`: The end date of the date range to retrieve the forecast data. Format: YYYY-MM-DD. Required parameter.

### Description:

This task retrieves forecast data for a given date range from the U.S. National Water Model. The start date and end date parameters are required, and the API will return the forecast data for the specified date range.

## Task 2: Retrieve Forecast Data by Location

### Existing REST API:

Similar to the GEOGLOWS ECMWF Streamflow Service, the following REST API can be used as an example for retrieving forecast data by location:

```
GET /api/forecast?latitude=XX.XXXX&longitude=YY.YYYY&radius=ZZ
```

### Proposed REST API:

The proposed REST API for retrieving forecast data by location is:

```
GET /api/forecast?latitude=XX.XXXX&longitude=YY.YYYY&radius=ZZ
```

### URI Query-String Pattern:

- `latitude`: The latitude of the location to retrieve the forecast data. Format: XX.XXXX. Required parameter.
- `longitude`: The longitude of the location to retrieve the forecast data. Format: YY.YYYY. Required parameter.
- `radius`: The radius around the specified location to retrieve the forecast data. Format: ZZ. Optional parameter.

### Description:

This task retrieves forecast data for a given location from the U.S. National Water Model. The latitude and longitude parameters are required, and the API will return the forecast data for the specified location. The radius parameter is optional, and if specified, the API will return the forecast data for the specified location within the specified radius.

## Task 3: Retrieve Forecast Data by Forecast Model

### Existing REST API:

Similar to the GEOGLOWS ECMWF Streamflow Service, the following REST API can be used as an example for retrieving forecast data by forecast model:

```
GET /api/forecast?model_name=ECMWF
```

### Proposed REST API:

The proposed REST API for retrieving forecast data by forecast model is:

```
GET /api/forecast?model_name=U.S. National Water Model
```

### URI Query-String Pattern:

- `model_name`: The name of the forecast model to retrieve the forecast data. Format: Text. Required parameter.

### Description:

This task retrieves forecast data for a given forecast model from the U.S. National Water Model. The model_name parameter is required, and the API will return the
