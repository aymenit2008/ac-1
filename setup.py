# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

with open('requirements.txt') as f:
	install_requires = f.read().strip().split('\n')

# get version from __version__ variable in ac/__init__.py
from ac import __version__ as version

setup(
	name='ac',
	version=version,
	description='AC',
	author='Aseel',
	author_email='aseelalmarhabi14@gmail.com',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
