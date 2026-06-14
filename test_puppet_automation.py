"""Test the puppet automation system end-to-end against the running dev server."""
from playwright.sync_api import sync_playwright
import json
import time

URL = "http://localhost:3000"
SHOTS = "G:/code/flowwater4/test_screenshots"
import os
os.makedirs(SHOTS, exist_ok=True)


def shot(page, name):
    path = f"{SHOTS}/{name}.png"
    page.screenshot(path=path, full_page=True)
    print(f"  → screenshot: {path}")


def run_state(page, fn_body):
    """Run JS in the page that touches useStore directly."""
    return page.evaluate(f"() => {{ {fn_body} }}")


with sync_playwright() as p:
    # Use system Edge — playwright chromium is still downloading
    browser = p.chromium.launch(headless=True, channel="msedge")
    context = browser.new_context(viewport={"width": 414, "height": 900})  # mobile-ish
    page = context.new_page()

    # Capture console logs
    console_logs = []
    page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: console_logs.append(f"[PAGEERROR] {err}"))

    print("== 1. Load app ==")
    page.goto(URL)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)

    # Reset localStorage so we start clean (avoid stale state from earlier sessions)
    page.evaluate("() => localStorage.clear()")
    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)

    shot(page, "01_home")

    # Check that store has new puppet keys
    print("\n== 2. Verify store has puppet automation state ==")
    state_summary = page.evaluate("""() => {
        // Find zustand store on window — it's not exposed by default,
        // but persist saves to localStorage. Check that.
        const raw = localStorage.getItem('flowwater-storage');
        if (!raw) return {err: 'no storage'};
        const parsed = JSON.parse(raw);
        const s = parsed.state;
        return {
            hasPuppets: 'puppets' in s,
            hasGardenPlots: 'gardenPlots' in s,
            hasAutomation: 'puppetAutomation' in s,
            puppetCount: (s.puppets || []).length,
            gardenPlotCount: (s.gardenPlots || []).length,
            automation: s.puppetAutomation,
        };
    }""")
    print(f"  Storage state: {json.dumps(state_summary, ensure_ascii=False, indent=2)}")
    assert state_summary.get("hasPuppets"), "puppets key missing from store"
    assert state_summary.get("hasGardenPlots"), "gardenPlots key missing"
    assert state_summary.get("hasAutomation"), "puppetAutomation key missing"
    assert state_summary["gardenPlotCount"] == 8, f"expected 8 plots, got {state_summary['gardenPlotCount']}"
    print("  ✅ Store keys all present, gardenPlots initialized to 8")

    print("\n== 3. Navigate to 洞府 ==")
    # Dismiss any onboarding modal first by clearing intro flags then reload
    page.evaluate("""() => {
        const raw = localStorage.getItem('flowwater-storage');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        // Mark intro as seen so the modal doesn't pop
        parsed.state.hasSeenIntro = true;
        parsed.state.hasDoneFirstDrink = true;
        parsed.state.hasSeenWelcome = true;
        // Set a starting region so the app has a current region
        parsed.state.currentRegion = parsed.state.currentRegion || '天南';
        localStorage.setItem('flowwater-storage', JSON.stringify(parsed));
    }""")
    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)

    # Try to dismiss any leftover modal by clicking outside or pressing Escape
    page.keyboard.press("Escape")
    page.wait_for_timeout(300)

    # Click 洞府 nav item — use the nav at bottom (a tag)
    nav_link = page.locator("nav a:has-text('洞府')")
    if nav_link.count() > 0:
        nav_link.first.click(force=True)
    else:
        page.click("text=洞府", force=True)
    page.wait_for_timeout(700)
    shot(page, "02_cave")

    # Check that CaveSteward shows the empty state hint
    cave_text = page.text_content("body")
    assert "洞府总管" in cave_text, "CaveSteward title not found"
    print("  ✅ '洞府总管' panel rendered")

    # The user starts at level 0 with no puppets, so we need to forcibly
    # bump cultivation, divine sense, and grant materials via store mutation.
    # Easiest: directly write to localStorage and reload.
    print("\n== 4. Inject test state: high level + materials + divine sense ==")
    page.evaluate("""() => {
        const raw = localStorage.getItem('flowwater-storage');
        const parsed = JSON.parse(raw);
        parsed.state.levelIndex = 20; // 元婴期 — unlocks lots of recipes
        parsed.state.spiritStones = 100000;
        parsed.state.materials = {
            common_herb: 50, rare_herb: 30, paper: 20, cinnabar: 20,
            monster_fur: 10, monster_bone: 10, profound_iron: 20,
            millennium_lingzhi: 10, jiuzhuan_grass: 5,
        };
        parsed.state.divineSense = { level: 3, exp: 0, maxSplit: 3 };
        localStorage.setItem('flowwater-storage', JSON.stringify(parsed));
    }""")
    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    page.locator("nav a:has-text('洞府')").first.click(force=True)
    page.wait_for_timeout(500)
    shot(page, "03_cave_with_materials")

    # Now scroll down to find PuppetMaster and craft a puppet
    print("\n== 5. Craft a puppet ==")
    # Scroll to bring PuppetMaster into view — it's under "神通"
    page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
    page.wait_for_timeout(300)
    shot(page, "04_scrolled_mid")

    # Find the 木傀儡 (wooden puppet) button — it should appear in PuppetMaster
    # Click it
    wooden_btn = page.locator("button:has-text('木傀儡')").first
    if wooden_btn.count() > 0:
        wooden_btn.click()
        print("  Clicked 木傀儡 craft button")
        page.wait_for_timeout(2500)  # 1.5s craft + buffer
    else:
        print("  ⚠️ 木傀儡 button not visible — let me inspect")
        # Print what's on the page that contains 傀儡
        all_buttons = page.locator("button").all()
        print(f"  Total buttons: {len(all_buttons)}")

    shot(page, "05_after_wooden_craft")

    # Verify puppet was added & deployed
    state2 = page.evaluate("""() => {
        const s = JSON.parse(localStorage.getItem('flowwater-storage')).state;
        return {
            puppetCount: s.puppets.length,
            puppets: s.puppets.map(p => ({name: p.name, deployed: p.deployed, power: p.power})),
        };
    }""")
    print(f"  After craft: {json.dumps(state2, ensure_ascii=False)}")
    assert state2["puppetCount"] == 1, f"expected 1 puppet, got {state2['puppetCount']}"
    assert state2["puppets"][0]["deployed"], "puppet should be deployed by default"
    print("  ✅ Puppet crafted and auto-deployed")

    # Craft another puppet — iron one (more power, faster automation)
    print("\n== 6. Craft a second puppet (兽形) ==")
    beast_btn = page.locator("button:has-text('兽形傀儡')").first
    if beast_btn.count() > 0:
        beast_btn.click()
        page.wait_for_timeout(2500)
        shot(page, "06_after_beast_craft")
    state3 = page.evaluate("""() => {
        const s = JSON.parse(localStorage.getItem('flowwater-storage')).state;
        return {n: s.puppets.length, totalPower: s.puppets.filter(p=>p.deployed).reduce((a,p)=>a+p.power*p.level,0)};
    }""")
    print(f"  After 2nd craft: {json.dumps(state3)}")
    print(f"  ✅ Total deployed power: {state3['totalPower']}")

    # Now scroll up to CaveSteward, verify it shows non-empty
    print("\n== 7. Scroll to CaveSteward and verify it shows puppet status ==")
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(500)
    shot(page, "07_steward_with_puppets")

    steward_text = page.text_content("body")
    assert "出战战力" in steward_text or "傀儡值班" in steward_text, "steward should show stats"
    print("  ✅ CaveSteward shows status")

    # Scroll to HerbGarden, plant something
    print("\n== 8. Plant a herb in 灵药园 (via direct state injection) ==")
    # Direct localStorage injection — UI test for picker is brittle, focus on automation
    page.evaluate("""() => {
        const raw = localStorage.getItem('flowwater-storage');
        const parsed = JSON.parse(raw);
        const now = Date.now();
        // Plant 凝气草 in plot 0, 洗髓草 in plot 1
        parsed.state.gardenPlots = parsed.state.gardenPlots.map((p, i) => {
            if (i === 0) return {...p, herbId: 'common_herb', plantedAt: now, lastHerbId: 'common_herb'};
            if (i === 1) return {...p, herbId: 'rare_herb', plantedAt: now, lastHerbId: 'rare_herb'};
            return p;
        });
        localStorage.setItem('flowwater-storage', JSON.stringify(parsed));
    }""")
    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    page.locator("nav a:has-text('洞府')").first.click(force=True)
    page.wait_for_timeout(500)
    page.evaluate(""" () => {
        const els = [...document.querySelectorAll('h3')];
        const t = els.find(e => e.textContent.includes('灵药园'));
        if (t) t.scrollIntoView({block:'center'});
    }""")
    page.wait_for_timeout(500)
    shot(page, "08_herb_garden_planted")

    state4 = page.evaluate("""() => {
        const s = JSON.parse(localStorage.getItem('flowwater-storage')).state;
        const planted = s.gardenPlots.filter(p => p.herbId);
        return {plantedCount: planted.length, plots: planted.map(p => ({herb: p.herbId, last: p.lastHerbId}))};
    }""")
    print(f"  Garden after plant: {json.dumps(state4, ensure_ascii=False)}")
    assert state4["plantedCount"] == 2, f"expected 2 planted, got {state4['plantedCount']}"
    print("  ✅ 2 plots planted (凝气草 + 洗髓草)")

    # —— Critical test: tick the puppet automation and verify herb gets grown + harvested ——
    print("\n== 9. Force-tick puppet automation (advance time, tick) ==")
    # Hack: shift the herb's plantedAt back by a long time so it's "mature", then tick
    page.evaluate("""() => {
        const raw = localStorage.getItem('flowwater-storage');
        const parsed = JSON.parse(raw);
        // Push plantedAt back 1 hour so all herbs mature
        parsed.state.gardenPlots = parsed.state.gardenPlots.map(p =>
            p.herbId ? {...p, plantedAt: Date.now() - 3600 * 1000} : p
        );
        // Push lastTickAt back 1 hour to credit action points
        parsed.state.puppetLastTickAt = Date.now() - 3600 * 1000;
        // Push spring back so it's full
        parsed.state.cave.lastSpringCollect = Date.now() - 25 * 3600 * 1000;
        parsed.state.cave.springQi = 0;
        localStorage.setItem('flowwater-storage', JSON.stringify(parsed));
    }""")
    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)  # Give time for App.tsx tick to run on mount

    page.locator("nav a:has-text('洞府')").first.click(force=True)
    page.wait_for_timeout(2500)  # Steward useEffect tick + render
    shot(page, "11_after_tick")

    state5 = page.evaluate("""() => {
        const s = JSON.parse(localStorage.getItem('flowwater-storage')).state;
        return {
            materials: s.materials,
            plotsAfterTick: s.gardenPlots.map(p => ({herb: p.herbId, last: p.lastHerbId, planted: p.plantedAt > 0})),
            actionsLeft: s.puppetActions,
            actionLog: s.puppetActivityLog.slice(0, 5),
            bonusPoints: s.bonusPoints,
            spring: s.cave.springQi,
        };
    }""")
    print(f"  After tick:")
    print(f"    materials: {json.dumps(state5['materials'], ensure_ascii=False)}")
    print(f"    plots: {json.dumps(state5['plotsAfterTick'], ensure_ascii=False)}")
    print(f"    actionsLeft: {state5['actionsLeft']}")
    print(f"    bonusPoints: {state5['bonusPoints']} (spring auto-collected → +240)")
    print(f"    activity log: {json.dumps(state5['actionLog'], ensure_ascii=False, indent=4)}")

    # Verify expected automation outcomes:
    # 1. Spring should be auto-collected — bonusPoints should jump
    # 2. Mature herbs should be harvested — materials[ningqi草 / common_herb] increases
    # 3. After harvest, lastHerbId should be preserved & plot should auto-replant
    log_texts = " | ".join(l["text"] for l in state5["actionLog"])
    print(f"\n  Combined log text: {log_texts}")

    has_harvest = "收获" in log_texts
    has_spring = "聚灵泉" in log_texts
    has_replant = "补种" in log_texts

    print(f"\n  ✓ harvest event: {has_harvest}")
    print(f"  ✓ spring collect: {has_spring}")
    print(f"  ✓ replant event: {has_replant}")

    # Now look at console errors
    print("\n== 10. Console error check ==")
    errors = [l for l in console_logs if "[error]" in l.lower() or "[pageerror]" in l.lower()]
    if errors:
        print("  ⚠️ Errors found:")
        for e in errors[:10]:
            print(f"    {e}")
    else:
        print("  ✅ No console errors")

    # Final summary
    print("\n=== TEST SUMMARY ===")
    all_ok = (
        state5["bonusPoints"] >= 240 and  # spring collected
        has_harvest and has_replant and
        not errors
    )
    print(f"  Spring auto-collect: {'✅' if state5['bonusPoints'] >= 240 else '❌'}")
    print(f"  Auto-harvest: {'✅' if has_harvest else '❌'}")
    print(f"  Auto-replant: {'✅' if has_replant else '❌'}")
    print(f"  No console errors: {'✅' if not errors else '❌'}")
    print(f"  OVERALL: {'✅ PASS' if all_ok else '❌ FAIL'}")

    browser.close()
