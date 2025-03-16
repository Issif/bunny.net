package main

import (
	"html/template"
	"log"
	"os"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
)

func main() {
	input, err := os.ReadFile("content.md")
	if err != nil {
		log.Fatal(err)
	}
	// create markdown parser with extensions
	p := parser.NewWithExtensions(parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock)
	content := p.Parse(input)

	// create HTML renderer with extensions
	htmlFlags := html.CommonFlags | html.HrefTargetBlank
	renderer := html.NewRenderer(html.RendererOptions{Flags: htmlFlags})

	md := markdown.Render(content, renderer)

	tmpl, err := template.ParseFiles("templates/index.html.tmpl")
	if err != nil {
		log.Fatal(err)
	}

	file, err := os.Create("index.html")
	if err != nil {
		log.Fatal(err)
	}

	type Data struct {
		Title  string
		Author string
		Body   template.HTML
	}

	err = tmpl.Execute(file, Data{
		Title:  "Performing A/B testing with Edge Scripting",
		Author: "Thomas Labarussias",
		Body:   template.HTML(string(md)),
	})
	if err != nil {
		log.Fatal(err)
	}
}
