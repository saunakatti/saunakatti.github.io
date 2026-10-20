# Style and Syntax

## Markdown

One of the goals of this revamp is to move to basic
markdown syntax. This is to improve compatibility between
different ways of working on this project. Also if a tool stops working,
it doesn't matter because nothing depends on the tool itself.
I'm also moving away from [Obsidian](#)
in favour of simpler tools.

### Line Lenght

All tools don't have an automatic line wrapper so
I've decided to to keep line length at around 80, which is a common
recommendation for readibility.

The website does not care about normal line breaks since markdown
actually ingnores those on default when rendered. If you want a line break to display
on something like the website, leave two empty spaces after a line.

### Links

Since the idea of this wiki is to work everywhere, only relative links
(eg. ../regions/atalval.md) are used. The website knows how to handle
relative links.

### Syntax Guide

<https://www.markdownguide.org/basic-syntax/>

### Math and other misc

Code should now work. Math not at the moment.

## File Names

I'm getting rid of spaces and capitalised letters in filenames. So something like
_Style and Syntax_ will be _style_and_syntax_. If you've ever used a command line
you know exactly why.

It's also to make linking the files to the websites _wikiData.json_ easier.

## Images

All images should be compressed and private metadata removed before they get
uploaded. Non-compressed files are stored locally.
