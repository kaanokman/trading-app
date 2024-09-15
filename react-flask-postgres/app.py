# imports
from flask import Flask, request, render_template, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import psycopg2
import requests
from datetime import datetime
import json
import re
from flask_cors import CORS
import locale
from decimal import Decimal

# app configuration
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@localhost/dbname'
db = SQLAlchemy(app)
CORS(app)

if __name__ == '__main__':
    app.run(debug=True)

# function to format a number into currency
def format_currency(value):
    return "${:,.2f}".format(value)

# status check
@app.route('/')
def status():
    return 'OK'

# login endpoint
@app.route('/login', methods=['POST'])
def login():

    # expected in following form:
    """
    {
        "client_id" : "123abc",
        "password" : "Qwert12345"
    }
    """

    # fetch json data
    data = request.get_json()
    client_id = data['client_id']
    attempted_password = data['password']

    # connect to database
    conn = psycopg2.connect("dbname=postgres user=postgres password=okman")
    cur = conn.cursor()

    # run command to append new login info to clients table
    cur.execute(
        
        """
        SELECT password FROM clients
        WHERE client_id = %s;
        """
        , 
        (client_id,)
        )
    
    # fetch what is returned
    response = cur.fetchall()

    # disconnect from database
    cur.close()
    conn.close()

    # retrieve real password
    if response != []:
        (p,) = response[0]
        actual_password = p
    # throw error if client ID does not exist
    else:
        return "Client ID does not exist."

    # check if password is correct
    if attempted_password == actual_password:
        return "Login Success"
    else:
        return "Incorrect password."

# function to validate password according to desired restrictions
def validate_password(password):
    """
    - at least 8 characters long
    - contains at least one uppercase letter
    - contains at least one lowercase letter
    - contains at least one number
    """
    # regex pattern
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$'
    
    # check if the password matches the pattern
    if re.match(pattern, password):
        return True
    else:
        return False

# signup endpoint
@app.route('/signup', methods=['POST'])
def signup():

    # expected in following form:
    """
    {
        "client_id" : "123abc",
        "password" : "Qwert12345"
    }
    """

    # fetch json data
    data = request.get_json()
    client_id = data['client_id']
    password = data['password']

    # if password is sufficient/valid
    if validate_password(password):
        
        if (" " in client_id):

            return "Client ID cannot contain any spaces."
        
        elif len(client_id) > 16:

            return "ClientID is too long, it must be at most 16 characters long."
        
        else:

            # connect to database
            conn = psycopg2.connect("dbname=postgres user=postgres password=okman")
            cur = conn.cursor()

            # run command to check if cleintid already exists
            cur.execute(
                
                """
                SELECT * FROM clients
                WHERE client_id = %s;
                """
                , 
                (client_id,)
                )
            
            # fetch what is returned
            response = cur.fetchall()
    
            # check if client ID already exists
            if response != []:
                "Client ID already exists."
            else:

                # set default starting balance to 0
                default_balance = 0

                # run command to append new row to clients table
                cur.execute(
                    
                    """
                    INSERT INTO clients(client_id, password, balance)
                    VALUES
                    (%s, %s, %s);
                    """
                    , 
                    (client_id, password, default_balance)
                    )

                # commit changes
                conn.commit()

                # disconnect from database
                cur.close()
                conn.close()

                return "Signup Success"
    
    # if password is insufficient/invalid
    else:
        return """
        Insufficient password: must contain at least one capital letter, 
        one lowercase letter, one number, and be at least 8 characters long.
        """
    
# endpoint to get cleint's current balance
@app.route('/get_balance', methods=['POST'])
def getBalance():

    # expected in following form:
    """
    {
        "client_id" : "123abc"
    }
    """

    # fetch json data
    data = request.get_json()

    # extract client ID
    client_id = data["client_id"]

    # connect to database
    conn = psycopg2.connect("dbname=postgres user=postgres password=okman")
    cur = conn.cursor()

    # run command to get balance of client
    cur.execute(
        
        """
        SELECT balance FROM clients
        WHERE client_id = %s;
        """
        , 
        (client_id,)
        )
    
    # fetch what is returned
    response = cur.fetchall()
    (b,) = response[0]
    balance = b

    # disconnect from database
    cur.close()
    conn.close()

    return jsonify({"client_balance": balance})

# endpoint that retrieves all transactions made by a given user
@app.route('/get_trades', methods=['POST'])
def getTrades():

    # expected in following form:
    """
    {
        "client_id" : "123abc"
    }
    """

    # fetch json data
    data = request.get_json()
    client_id = data["client_id"]

    # connect to database
    conn = psycopg2.connect("dbname=postgres user=postgres password=okman")
    cur = conn.cursor()

    # run command to append new row to transations table
    cur.execute(
        
        """
        SELECT stock_ticker, action, num_shares, stock_price, total_price, timestamp FROM trades
        WHERE client_id = %s;
        """
        , 
        (client_id,)
        )
    
    # fetch what is returned
    response = cur.fetchall()

    # disconnect from database
    cur.close()
    conn.close()

    return jsonify(response)

# endpoint that retrieves all transactions made by a given user
@app.route('/search', methods=['POST'])
def getResults():

    # expected in following form:
    """
    {
        "query" : "AA"
    }
    """

    # fetch json data
    data = request.get_json()
    query = data["query"]

    # connect to database
    conn = psycopg2.connect("dbname=postgres user=postgres password=okman")
    cur = conn.cursor()

    # run command to append new row to transations table
    cur.execute("""
                SELECT ticker, company 
                FROM tickers 
                WHERE ticker ILIKE %s OR company ILIKE %s
                """,
                (f'%{query}%', f'%{query}%')
                )
    
    # fetch what is returned
    response = cur.fetchall()

    # disconnect from database
    cur.close()
    conn.close()

    return jsonify(response)

# endpoint that retrieves all transactions made by a given user
@app.route('/get_portfolio', methods=['POST'])
def getPortfolio():

    # expected in following form:
    """
    {
        "client_id" : "123abc"
    }
    """

    # fetch json data
    data = request.get_json()
    client_id = data["client_id"]

    # connect to database
    conn = psycopg2.connect("dbname=postgres user=postgres password=okman")
    cur = conn.cursor()

    # run command to append new row to transations table
    cur.execute(
        
        """
        SELECT stock_ticker, num_shares, total_price_paid FROM portfolios
        WHERE client_id = %s;
        """
        , 
        (client_id,)
        )
    
    # fetch what is returned
    response = cur.fetchall()

    # polygon api key
    api_key = ""

    # list to hold the portfolio with the added total value of each stock
    portfolio_with_values = []

    for row in response:
        (stock_ticker, num_shares, total_price_paid) = row
        url = f"https://api.polygon.io/v2/aggs/ticker/{stock_ticker}/prev?adjusted=true&apiKey={api_key}"
        response = requests.get(url)
        data = response.json()

        # check if trade limit is reached
        if 'results' not in data.keys():
            total_value = "API Limit Exceeded"
        else:
            stock_price = data['results'][0]['c']
            total_value = num_shares * stock_price

        # append the row with total value to the portfolio list
        portfolio_with_values.append((stock_ticker, num_shares, total_price_paid, total_value))
        
    # disconnect from database
    cur.close()
    conn.close()

    return jsonify(portfolio_with_values)

# function to update client portfolios in the database
def updatePortfolios(data):

    # expected in following form:
    """
    {
        "client_id" : "123abc",
        "stock_ticker" : "AAPL",
        "num_shares" : 10,
        "action" : "BUY",
        "total_price" : 100
    }
    """

    # fetch json data
    client_id = data["client_id"]
    stock_ticker = data["stock_ticker"]
    num_shares = int(data["num_shares"])
    action = data["action"]
    total_price = float(data["total_price"])

    # determine change in shares
    if action == "BUY":
        change_in_shares = num_shares
        total_price_paid = total_price
    else:
        change_in_shares = -num_shares
        total_price_paid = -total_price
        
    # connect to database
    conn = psycopg2.connect("dbname=postgres user=postgres password=okman")
    cur = conn.cursor()

    # run command to update number of shares owned of this stock by client or create new entry
    cur.execute(
        
        """
        INSERT INTO portfolios(client_id, stock_ticker, num_shares, total_price_paid)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (client_id, stock_ticker)
        DO UPDATE SET 
            num_shares = portfolios.num_shares + EXCLUDED.num_shares,
            total_price_paid = portfolios.total_price_paid + EXCLUDED.total_price_paid;
        """
        , 
        (client_id, stock_ticker, change_in_shares, total_price_paid)
        )

    # commit changes
    conn.commit()

     # Check if the number of shares is now 0 and delete the row if necessary
    cur.execute(
        """
        DELETE FROM portfolios
        WHERE client_id = %s AND stock_ticker = %s AND num_shares <= 0;
        """,
        (client_id, stock_ticker)
    )

    # commit any deletion changes
    conn.commit()

    # disconnect from database
    cur.close()
    conn.close()

    return "Portfolio updated."

# function to get the number of shares owned by a client given a stock
def getShares(data):

     # expected in following form:
    """
    {
        "client_id" : "123abc",
        "stock_ticker" : "AAPL"
    }
    """

    # fetch json data
    data = request.get_json()
    client_id = data["client_id"]
    stock_ticker = data["stock_ticker"]

    # connect to database
    conn = psycopg2.connect("dbname=postgres user=postgres password=okman")
    cur = conn.cursor()

    # get total shares bought and sold
    cur.execute(
    """
    SELECT action, SUM(num_shares) FROM trades
    WHERE client_id = %s AND stock_ticker = %s
    GROUP BY action;
    """
    , 
    (client_id, stock_ticker)
    )

    # fetch what is returned
    response = cur.fetchall()

    # disconnect from database
    cur.close()
    conn.close()

    # check if no shares are owned
    if response == []:        
        return 0

    else:
        
        owned_shares = 0

        # calcuate number of shares owned now
        for (action, shares) in response:
            if action == 'BUY':
                owned_shares += shares
            elif action == 'SELL':
                owned_shares -= shares
    
    return owned_shares

# endpoint to get cleint's current balance
@app.route('/update_balance', methods=['POST'])
def updateBalance():

    # expected in following form:
    """
    {
        "client_id" : "123abc",
        "change" : -10
    }
    """

    # fetch json data
    data = request.get_json()
    client_id = data["client_id"]
    change = data["change"]

    # connect to database
    conn = psycopg2.connect("dbname=postgres user=postgres password=okman")
    cur = conn.cursor()

    # run command to get balance of client
    cur.execute(
        
        """
        UPDATE clients
        SET balance = clients.balance + %s
        WHERE client_id = %s;
        """
        , 
        (change, client_id)
        )
    
    # commit changes
    conn.commit()

    # disconnect from database
    cur.close()
    conn.close()

    return "Balance updated."

# endpoint that posts new trade to trades table in database
@app.route('/get_quote', methods=['POST'])
def getQuote():

    # expected in following form:
    """
    {
        "stock_ticker" : "AAPL"
    }
    """

    # fetch json data
    data = request.get_json()

    # extract values
    stock_ticker = data["stock_ticker"]

    # polygon api key
    api_key = "i3plXS1C7WqbJ_x2pCmITlPybDj_p3Bm"
    url = f"https://api.polygon.io/v2/aggs/ticker/{stock_ticker}/prev?adjusted=true&apiKey={api_key}"
    response = requests.get(url)
    data = response.json()

    # check if trade limit is reached
    if 'results' not in data.keys():
        return {"message": "Trade limit exceeded, please try again later in about 1 minute.", "stock_price": None}

    # get stock price
    stock_price = data['results'][0]['c']

    return {"message": None, "stock_price": stock_price}

# endpoint that posts new trade to trades table in database
@app.route('/make_trade', methods=['POST'])
def makeTrade():

    # expected in following form:
    """
    {
        "client_id" : "123abc",
        "action" : "BUY",
        "stock_ticker" : "AAPL",
        "num_shares" : 10
    }
    """

    # fetch json data
    data = request.get_json()

    # extract values
    client_id = data["client_id"]
    action = data["action"]
    stock_ticker = data["stock_ticker"]
    num_shares = int(data["num_shares"])
    stock_price = data["stock_price"]

    # check if user is attempting to buy or sell 0 shares
    if action == "BUY" and num_shares == 0:
        return "Cannot buy 0 shares. Please pick a quantity above 0."
    elif action == "SELL" and num_shares == 0:
        return "Cannot sell 0 shares. Please pick a quantity above 0."

    # calculate current timestamp
    timestamp = datetime.now().isoformat()

    # calculate total price of trade
    total_price = stock_price * num_shares

    # connect to database
    conn = psycopg2.connect("dbname=postgres user=postgres password=okman")
    cur = conn.cursor()

    # get clients balance
    cur.execute(
        
        """
        SELECT balance FROM clients
        WHERE client_id = %s;
        """
        , 
        (client_id,)
        )
    
    # fetch what is returned
    response = cur.fetchall()
    (b,) = response[0]
    balance = b

    # if insufficient funds for trade
    if action == "BUY" and balance < total_price:

        # disconnect from database
        cur.close()
        conn.close()

        return f"Insufficient Funds. Trade would cost {format_currency(total_price)}, but you have a balance of {format_currency(balance)}."
    
    elif action == "SELL":

        # get number of owned shares now
        data = jsonify({"client_id" : "123abc", "stock_ticker" : "AAPL"})
        owned_shares = getShares(data)

        # if not enough shares to sell
        if owned_shares < num_shares:

            return f"Not enough shares to sell. You are attempting to sell {num_shares} shares of {stock_ticker}, but you have {owned_shares} shares."

    # run command to append new row to trades table
    cur.execute(
        
        """
        INSERT INTO trades(client_id, action, stock_ticker, num_shares, stock_price, total_price, timestamp)
        VALUES
        (%s, %s, %s, %s, %s, %s, %s);
        """
        , 
        (client_id, action, stock_ticker, num_shares, stock_price, total_price, timestamp)
        )
    
    # ensure balance is a decimal
    balance = float(balance)

    # ensure total_price is a decimal
    total_price = float(total_price)

    # if action is buy, update balance by subtracting
    if action == "BUY":
        cur.execute(
            
            """
            UPDATE clients
            SET balance = %s
            WHERE client_id = %s;
            """
            , 
            (balance - total_price, client_id)
            )
        
    # if action is sell, update balance by adding
    else:
        cur.execute(
            
            """
            UPDATE clients
            SET balance = %s
            WHERE client_id = %s;
            """
            , 
            (balance + total_price, client_id)
            )

    # commit changes
    conn.commit()

    # disconnect from database
    cur.close()
    conn.close()

    # update client portfolio
    data = {
            "client_id" : client_id,
            "stock_ticker" : stock_ticker,
            "num_shares" : num_shares,
            "action" : action,
            "total_price" : total_price
            }  

    updatePortfolios(data)

    return {"message": "Trade Complete.", "total_price": total_price, "old_balance": balance}