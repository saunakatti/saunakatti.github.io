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

I'm getting rid of spaces and capitalised letters in filenames.
So something like _Style and Syntax_ will be _style_and_syntax_.
If you've ever used a command line you know exactly why. No __THE__
in these filenames or IDs.

It's also to make linking the files to the websites
_wikiData.json_ easier.

## Images

All images should be compressed and private metadata removed before
they get uploaded. Non-compressed files are stored locally.

## Artificial Intelligence

The use of AI for the project (includes text, images, ideas, etc) is forbidden.

## Entries

The best way of starting a wiki entry is to add the same description
that is found for it in _wikiData.json_. Since the Wikipedia style red links
get the info of a nonexistent entry through _wikiData.json_, an item with an
entry in _wikiData.json_ should also have at least the description from there
copied to the markdown article.

> [!IMPORTANT]
> Every entry must have the entry title as H1 (# Title) on the first line.
> This is the only H1 of the entry.

## wikiData.json

This is the correct format for entries in wikidata.json (under its respective category):

```json
// The ID found on the map. If not on the map, use one according to syntax.
"nexus": {
    // A clean title you want to be visible.
    "title": "The Nexus",
    // Aliases, if none leave just ""
    "aliases": ["The Emitter Region", "something", "something"],
    // Type e.g. this is under regions but it's a nebula so "Nebula", if it's just
    // the group name use it as the type e.g. "Region".
    "type": "Nebula",
    // Attributes, you can technically list as many as you want but I'd recommend max 5 to keep it clean.
    "attributes": {
        "Danger Level": "Extreme",
        "Location": "Capricorn's Great Nebula"
    },
    // A short, preferably quite a lot longer than this one, summary of the entry.
    // JS parses Wiki-style links which use [[id|label]] format. The description must be on one line. (Ask json, not me.)
    "description": "An area of extreme cosmic activity in the eye of [[great_nebula|The Great Nebula]]. Traversing here is thought to be impossible. Hides the [[ajankajo|Ajankajo]] System.",
    // The relative path to the entries full markdown article.
    "entryPath": "worldbuilding/wiki/regions/nexus.md",
    // Set to "true" if entry can be found visually on the map. If not set to "false".
    "onMap": true
},

```