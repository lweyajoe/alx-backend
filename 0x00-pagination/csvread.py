import csv

with open('file.txt') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    print(type(csv_reader))