import {test,expect} from "@playwright/test";
import {modules} from "../data/modules";
test("landing, all persona previews and 15 module workflows",async({page},info)=>{
 await page.goto("/");await expect(page.getByRole("heading",{level:1})).toContainText("Better Decisions.");
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath("landing.png")});
 for(const [role,label] of [["student","Student"],["faculty","Faculty"],["admin","Admin"]]){
 await page.getByRole("button",{name:label,exact:true}).click();await page.getByRole("link",{name:"Open this preview"}).click();
 await expect(page).toHaveURL(new RegExp("/preview/"+role+"$"));await page.screenshot({path:info.outputPath(role+".png")});
 await page.getByRole("link",{name:"<- Campus Nexus"}).click();
 }
 await page.getByRole("link",{name:"All 15 modules"}).click();
 for(const item of modules){await page.getByRole("link",{name:`Open ${item.name}`,exact:true}).click();await expect(page).toHaveURL(new RegExp(`/modules/${item.id}$`));await expect(page.getByRole("heading",{level:1})).toHaveText(item.name);await page.getByText("Review this example").click();await expect(page.getByText(item.note)).toBeVisible();await page.getByRole("link",{name:"<- Module catalog"}).click();await expect(page).toHaveURL(/\/modules$/);}
});
