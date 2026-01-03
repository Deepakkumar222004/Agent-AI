from app.utils.city_extractor import extract_city
from app.utils.nlp_utils import extract_day
from app.tools.weather_provider import get_weather_data

from datetime import date
from app.tools.weather_tools import get_weather_structured

from datetime import date, timedelta



def handle_weather_query(user_query: str) -> str:
    city = extract_city(user_query)
    day = extract_day(user_query)
    return get_weather_data(city, day)


def get_weather_for_date(city: str, target_date: date) -> dict:
    """
    Agent 1 helper function.
    Returns simplified weather info for a given date.
    """

    return get_weather_structured(city, target_date)




def get_weather_for_date(city: str, target_date: date) -> dict:
    """
    Agent 1: Weather Intelligence Agent
    """
    return get_weather_structured(city, target_date)

