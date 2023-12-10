"""
installations
pip install zhconv
"""

from google.colab import drive
import pandas as pd
import re
from zhconv import convert


if __name__ == "__main__":
    # read in the train csv
    df = pd.read_csv('/content/drive/My Drive/AIM_Labs/data_aishell3/train/train_transformed_content.csv')
    df.head(5)
    drive.mount('/content/drive', force_remount = True)

    # create columns for both unicode, which is the strings in unicode form with space separations, and unicode_no_space
    # which is unicode for the characters without spaces separating them 
    df['unicode'] = '' 
    df['unicode_no_space'] = ''
    bad_rows = [] # contain "er"

    for row in range(0, len(df.index)):
        uncd = ''
        uncd_no_space = ''
        cell = df.loc[row, ['chinese']] # get the chinese text
        bad = False
        for i in range(2, len(cell[0]), 5): # every 5 chars is one word
            char = cell[0][i]
            if char == "'":
                bad_rows.append(row) # this means that the format is wrong
                bad = True
            traditional = convert(char, 'zh-tw') # convert the character into its traditional chinese version
            res = (re.sub('.', lambda x: r'\u%04X' % ord(x.group()), traditional)) # get the unicode
            uncd += ' '
            uncd += str(res).lower()
            uncd_no_space += str(res).lower()
        
        # write out the final unicode string for the sentence, or BAD if it has invalid input (which is usually caused by the er word messing up the every 5 count)
        if not bad:
            df.loc[row, ['unicode']] = '"' + uncd[1:] + '"'
            df.loc[row, ['unicode_no_space']] = '"' + uncd_no_space + '"'
        else:
            df.loc[row, ['unicode']] = "\"BAD\""
            df.loc[row, ['unicode_no_space']] = "\"BAD\""
    
    # save it 
    df.to_csv('/content/drive/MyDrive/AIM_Labs/data_aishell3/train/train_transformed_content_unicode.csv')
    df = pd.read_csv('/content/drive/My Drive/AIM_Labs/data_aishell3/test/test_transformed_content.csv')

    # now do the same for the test set
    
    df['unicode'] = ''
    df['unicode_no_space'] = ''
    bad_rows_test = []

    
    for row in range(0, len(df.index)):
        uncd = ''
        uncd_no_space = ''
        cell = df.loc[row, ['chinese']]
        bad = False
        for i in range(2, len(cell[0]), 5):
            char = cell[0][i]
            if char == "'":
                bad_rows.append(row)
                bad = True
            traditional = convert(char, 'zh-tw')
            res = (re.sub('.', lambda x: r'\u%04X' % ord(x.group()), traditional))
            uncd += ' '
            uncd += str(res).lower()
            uncd_no_space += str(res).lower()
        if not bad:
            df.loc[row, ['unicode']] = '"' + uncd[1:] + '"'
            df.loc[row, ['unicode_no_space']] = '"' + uncd_no_space + '"'
        else:
            df.loc[row, ['unicode']] = "\"BAD\""
            df.loc[row, ['unicode_no_space']] = "\"BAD\""

    df.to_csv('/content/drive/MyDrive/AIM_Labs/data_aishell3/test/test_transformed_content_unicode.csv')
