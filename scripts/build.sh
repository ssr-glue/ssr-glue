#!/bin/bash

cd packages || exit

for package in *
do
  cd "$package" || exit

  echo "-------------------------"
  echo "Building $package ..."
  echo "-------------------------"

  yarn build
  cd ..
done
