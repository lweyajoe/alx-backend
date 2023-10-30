#!/usr/bin/env python3
"""
Deletion-resilient hypermedia pagination
"""

import csv
import math
from typing import Dict, List


class Server:
    """Server class to paginate a database of popular baby names.
    """
    DATA_FILE = "Popular_Baby_Names.csv"

    def __init__(self):
        self.__dataset = None
        self.__indexed_dataset = None

    def dataset(self) -> List[List]:
        """Cached dataset
        """
        if self.__dataset is None:
            with open(self.DATA_FILE) as f:
                reader = csv.reader(f)
                dataset = [row for row in reader]
            self.__dataset = dataset[1:]

        return self.__dataset

    def indexed_dataset(self) -> Dict[int, List]:
        """Dataset indexed by sorting position, starting at 0
        """
        if self.__indexed_dataset is None:
            dataset = self.dataset()
            truncated_dataset = dataset[:1000]
            self.__indexed_dataset = {
                i: dataset[i] for i in range(len(dataset))
            }
        return self.__indexed_dataset

    def get_hyper_index(self, index: int = None, page_size: int = 10) -> Dict:
        """
            return a dictionary with the ff k-v pairs
            index: index of the first item in the current page
            next_index: next index to query
            page_size: the current page size
            data: the dataset
        """
        idx_data_set = self.indexed_dataset()
        data_length = len(idx_data_set)
        assert type(index) is int and 0 <= index < data_length

        dict_t = {}
        data = []
        dict_t['index'] = index

        for i in range(page_size):
            while True:
                element = idx_data_set.get(index)
                index += 1
                if element is not None:
                    break
            data.append(element)

        dict_t['data'] = data
        dict_t['page_size'] = len(data)

        if idx_data_set.get(index):
            dict_t['next_index'] = index
        else:
            dict_t['next_index'] = None
        return dict_t
