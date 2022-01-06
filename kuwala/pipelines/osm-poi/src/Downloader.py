import os
from python_utils.src.FileDownloader import download_file
from python_utils.src.FileSelector import select_osm_file
import urllib.request as req
import zipfile
import json
import pandas as pd

class Downloader:
    @staticmethod
    def download_pbf(args):
        file = None

        if args.url is None:
            file = select_osm_file()

        script_dir = os.path.dirname(__file__)
        file_path = os.path.join(script_dir, f'../tmp/osmFiles/pbf/{args.continent or file["continent"]}')

        if args.country or (file and file['country']):
            file_path += f'/{args.country or file["country"]}'

        if args.country_region or (file and file['country_region']):
            file_path += f'/{args.country_region or file["country_region"]}'

        file_path += '.osm.pbf'

        download_file(url=args.url or file['url'], path=file_path)

    @staticmethod
    def download_names():
        # here, instead of cloning the repository that recommended using extra library,
        # we download the whole repo in zip, then extract it.
        if not os.path.exists('../tmp/name-suggestion-index-main'):
            download_link='https://github.com/osmlab/name-suggestion-index/archive/refs/heads/main.zip'
            req.urlretrieve(download_link, "../tmp/main.zip")
            with zipfile.ZipFile('../tmp/main.zip', 'r') as zip_ref:
                zip_ref.extractall('../tmp/')
            os.remove('../tmp/main.zip')

        file_paths=['../tmp/name-suggestion-index-main/data/brands','../tmp/name-suggestion-index-main/data/operators']
        data = {'id': [], 'display_name': [], 'wiki_data': []}
        for file_path in file_paths:
            for folder in os.listdir(file_path):
                if os.path.isdir(os.path.join(file_path,folder)):
                    for file in os.listdir(os.path.join(file_path,folder)):
                        with open(os.path.join(file_path,folders,file)) as f:
                            file_content=json.load(f)
                        for item in file_content['items'] :
                            wiki_data=id=display_name='-'
                            if ('id' in item.keys()):
                                id=(dict(item)['id'])
                            if ('displayName' in item.keys()):
                                display_name=(dict(item)['displayName'])
                            if ("tags" in item.keys()):
                                if ('brand:wikidata' in list(item['tags'].keys())):
                                    wiki_data=(dict(item["tags"].items())['brand:wikidata'])

                            data['id'].append(id)
                            data['display_name'].append(display_name)
                            data['wiki_data'].append(wiki_data)

        df=pd.DataFrame(data)
        df.to_csv('../tmp/names.csv',index=False)