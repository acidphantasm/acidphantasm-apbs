﻿using APBSConfig.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace APBSConfig.Core
{
    internal class Utils
    {
        public static IEnumerable<string> TextObjectIDValidation(string value)
        {
            if (!string.IsNullOrEmpty(value) && (value.Length != 24 || !IsHex(value)))
            {
                yield return "Invalid MongoID";
            }
        }
        public static bool IsHex(IEnumerable<char> chars)
        {
            bool isHex;
            foreach (var c in chars)
            {
                isHex = ((c >= '0' && c <= '9') ||
                         (c >= 'a' && c <= 'f') ||
                         (c >= 'A' && c <= 'F'));

                if (!isHex)
                {
                    Console.WriteLine(isHex);
                    return false;
                }
            }
            return true;
        }

        public static bool IsHexAndValidLength(string value)
        {
            if (value.Length == 24 && IsHex(value)) return true;
            else return false;
        }

        public static void UpdateViewBool(bool holder, bool actual)
        {
            if (holder != actual)
            {
                MainLayout.EnableUnsavedChangesButton();
            }
        }

        public static void UpdateViewInt(int holder, int actual)
        {
            if (holder != actual)
            {
                MainLayout.EnableUnsavedChangesButton();
            }
        }

        public static void UpdateViewListInt(List<int> holder, List<int> actual)
        {
            bool isListSame = Enumerable.SequenceEqual(holder, actual);
            if (!isListSame)
            {
                MainLayout.EnableUnsavedChangesButton();
            }
        }

        public static void UpdateViewListString(List<string> holder, List<string> actual)
        {
            bool isListSame = Enumerable.SequenceEqual(holder, actual);
            if (!isListSame)
            {
                MainLayout.EnableUnsavedChangesButton();
            }
        }
    }
}
