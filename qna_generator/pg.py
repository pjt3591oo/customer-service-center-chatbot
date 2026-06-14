import psycopg2

host = "localhost"
port = 5432
dbname = "chatbot"
user = "admin"
password = "admin1234"

def get_connection():
    return psycopg2.connect(
        host=host, port=port,
        dbname=dbname, user=user, password=password
    )
