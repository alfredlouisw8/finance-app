import pandas as pd
import numpy as np
from pandas_datareader import data as pdr
import matplotlib.pyplot as plt
import scipy.optimize as sco
import yfinance as yf
import datetime

####################################
#           STOCK RETURN           #
####################################
def stockret(ticker, start, end):
    
    df = pdr.get_data_yahoo(ticker, start=start, end=end)
    df[ticker] = np.log(df['Adj Close'] / df['Adj Close'].shift(1))
    df = df[ticker].to_frame().dropna()
    
    return df


def stockrets(ticker, start, end):
    
    df = yf.download(ticker, start=start, end=end)
    df[ticker] = np.log(df['Adj Close'] / df['Adj Close'].shift(1))
    df = df[ticker].fillna(0)
    
    return df


def beta(stock, index, start, end, interval='wk'):
    """
    default: 3 years, weekly return
    """
    tickers = [stock, index]

    ret = stockrets(tickers, start, end, interval)
    
    cmat = ret.cov()
    cov = cmat.loc[stock, index]
    var = ret[index].var()
    beta = (cov/var).iloc[0]
    
    return beta


def beta_adj(stock, index, start, end, int='wk'):
    """
    default: 3 years, weekly return
    """
    
    tickers = [stock, index]

    ret = stockrets(tickers, start, end, int)
    
    cmat = ret.cov()
    cov = cmat.loc[stock, index]
    var = ret[index].var()
    beta = (cov/var).iloc[0]    
    
    adj_beta = 2/3 * beta + 1/3
    
    return adj_beta


####################################
#            PERFORMANCE           #
####################################
def performance(port_ret):
    mean_return = port_ret.mean()*252
    volatility = port_ret.std()*np.sqrt(252)
    rr_ratio = (port_ret.mean()*252) / (port_ret.std()*np.sqrt(252))
    p_positive = port_ret[port_ret>0].count()/port_ret.count()
    worst = port_ret.min()
    best = port_ret.max()
    
    #we derive the portfolio values from the monthly returns
    port_val = port_ret.cumsum().apply(np.exp)
    rolling_peak = port_val.rolling(252).max()
    drawdown = np.log(port_val/rolling_peak)
    max_drawdown = drawdown.min().rename('Max Drawdown')

    performance = pd.DataFrame({'Mean Return': mean_return,
                                'St. Dev.': volatility,
                                'RR Ratio': rr_ratio,
                                '% Positive': p_positive,
                                'Worst Day': worst,
                                'Best Day': best,
                                'Max DrawDown': max_drawdown})
    
    return performance.transpose().style.set_precision(4)


####################################
#           OPTIMIZATION           #
####################################
# PART 1: Calculates portfolio risk and return as a function of the 
# weights vector, returns vector and var-cov matrix
def portfolio_performance(weights, mean_returns, cov_matrix):
    returns = np.dot(weights.T, mean_returns)  
    std = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
    return std, returns

# PART 2: Calculates the sharpe ratio as a fucntion of weights vector, 
# returns vector, var-cov matrix and risk-free. 
# Notice that this function calls the previous one
def neg_sharpe_ratio(weights, mean_returns, cov_matrix, risk_free_rate):
    p_std, p_ret = portfolio_performance(weights, mean_returns, cov_matrix)
    return -(p_ret - risk_free_rate) / p_std

# PART 3: Performs the optimization
def max_sharpe_ratio(mean_returns, cov_matrix, risk_free_rate, max_allocation=1):
    
    import scipy.optimize as sco
    
    #Extract the number of assets from the length of the returns vector
    num_assets = len(mean_returns)
    
    #Creates a tuple with the variables to be uses by the objective function
    args = (mean_returns, cov_matrix, risk_free_rate)
    
    #The Constrating that the sum of the weight has to be equal to one
    constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
    
    # Individual weights between minus 100% and plus 100%. We allow for negative 
    # weights in case we have a factor that performs really poorly we may add it 
    # with negative weight
    bound = (0.0,max_allocation)
    bounds = tuple(bound for asset in range(num_assets))
    
    # This runs the actual minimization of the negative Sharpe
    result = sco.minimize(neg_sharpe_ratio, num_assets*[1./num_assets,],
                          args=args,
                          method='SLSQP', bounds=bounds,
                          constraints=constraints)
    
    # This put the results in a series
    opt_weights = pd.Series(result['x'], index=mean_returns.index)
    return opt_weights

def weight_opt(stockret, risk_free, max_allocation=1, pct_equity=1):
    
    #We calculate active return (stockret - risk_free)
    rf = risk_free/252
    active_return = stockret - rf
    
    #We calculate the optimization inputs
    mean_returns = active_return.mean()*252
    cov_matrix = active_return.cov()*252
    
    #We run the optimization
    opt_weights = max_sharpe_ratio(mean_returns,
                                   cov_matrix, rf,
                                   max_allocation)
    opt_weights = opt_weights.round(4)
    
    #We return the optimal weights
    return (opt_weights*pct_equity)

def port_opt (stockret, weight):
    stockret['Optimized'] = (stockret*weight).sum(axis=1)
    
    return stockret

def port_plot (port):
    plot = port.cumsum().apply(np.exp).plot(figsize=(18,10))
    plt.xlabel('Date')
    plt.ylabel('Value')
    plt.title('Stocks Performance over the Years')
    plt.legend()
    return plot