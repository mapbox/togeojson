import { extractStyle } from "./extractStyle";
import xmldom from "@xmldom/xmldom";

function parse(xml: string): Element {
  return new xmldom.DOMParser().parseFromString(xml).firstChild as Element;
}

describe("extractStyle", () => {
  it("passes-through CSS colors", () => {
    expect(
      extractStyle(
        parse(`<Style>
<IconStyle>
<Icon>
<href>https://earth.google.com/earth/rpc/cc/icon?color=1976d2&amp;id=2000&amp;scale=4</href>
</Icon>
<hotSpot x="64" y="128" xunits="pixels" yunits="insetPixels"/>
</IconStyle>
<LabelStyle>
</LabelStyle>
<LineStyle>
<color>ff9f3f30</color>
<width>2.13333</width>
</LineStyle>
<PolyStyle>
<color>4058eeff</color>
</PolyStyle>
<BalloonStyle>
<displayMode>hide</displayMode>
</BalloonStyle>
</Style>`)
      )
    ).toMatchInlineSnapshot(`
      Object {
        "fill": "#ffee58",
        "fill-opacity": 0.25098039215686274,
        "icon": "https://earth.google.com/earth/rpc/cc/icon?color=1976d2&id=2000&scale=4",
        "icon-offset": Array [
          64,
          128,
        ],
        "stroke": "#303f9f",
        "stroke-opacity": 1,
        "stroke-width": 2.13333,
      }
    `);
  });
  it("passes-through CSS colors", () => {
    expect(
      extractStyle(
        parse(`<Style>
      <IconStyle>
        <color>ffd18802</color>
        <scale>1</scale>
        <Icon>
          <href>https://www.gstatic.com/mapspro/images/stock/503-wht-blank_maps.png</href>
        </Icon>
        <hotSpot x="32" xunits="pixels" y="64" yunits="insetPixels"/>
      </IconStyle>
      <LabelStyle>
        <scale>0</scale>
      </LabelStyle>
      <BalloonStyle>
        <text><![CDATA[<h3>$[name]</h3>]]></text>
      </BalloonStyle>
    </Style>`)
      )
    ).toMatchInlineSnapshot(`
      Object {
        "icon": "https://www.gstatic.com/mapspro/images/stock/503-wht-blank_maps.png",
        "icon-color": "#0288d1",
        "icon-offset": Array [
          32,
          64,
        ],
        "icon-opacity": 1,
        "icon-scale": 1,
      }
    `);
  });
});
