#!/bin/sh

if [ $# -ne 3 ]; then
    echo "使用法: $0 <演算子> <数値1> <数値2>"
    echo "例: $0 + 1 2    -> 3"
    echo "例: $0 x 15 20  -> 300"
    exit 1
fi

operator=$1
num1=$2
num2=$3

if ! echo "$num1" | grep -q '^-\?[0-9]\+$' || ! echo "$num2" | grep -q '^-\?[0-9]\+$'; then
    echo "エラー: 数値を入力してください"
    exit 1
fi

case $operator in
    "+")
        result=$((num1 + num2))
        ;;
    "-")
        result=$((num1 - num2))
        ;;
    "x"|"*")
        result=$((num1 * num2))
        ;;
    "/")
        if [ $num2 -eq 0 ]; then
            echo "エラー: ゼロで割ることはできません"
            exit 1
        fi
        result=$((num1 / num2))
        ;;
    *)
        echo "エラー: サポートされていない演算子です: $operator"
        echo "対応演算子: + - x * /"
        exit 1
        ;;
esac

echo $result