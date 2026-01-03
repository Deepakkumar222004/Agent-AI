from app.agents.weather_agent import handle_weather_query

def test_today_weather():
    result = handle_weather_query("What is the weather in Chennai today?")
    assert "Today" in result or "Today's" in result

def test_tomorrow_weather():
    result = handle_weather_query("What will the weather be like in London tomorrow?")
    assert "Tomorrow" in result

def test_yesterday_weather():
    result = handle_weather_query("What was the weather in Delhi yesterday?")
    assert "Yesterday" in result or "not available" in result
