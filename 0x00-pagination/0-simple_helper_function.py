#!/usr/bin/env python3
"""
    A simple function that takes two int args
    'page' and 'page_size'
    returns a tuple of size 2
    containing a start and end index

"""


def index_range(page: int, page_size: int) -> tuple:
    """
        page: the page to be indexed
        page_size: the number of indexes a page should have
        returns a tuple of index ranges
    """
    start_index = 0
    end_index = 0

    for i in range(page):
        start_index = end_index
        end_index = end_index + page_size

    return (start_index, end_index)
